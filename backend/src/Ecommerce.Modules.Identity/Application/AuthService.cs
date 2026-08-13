using Ecommerce.Modules.Audit.Application;
using Ecommerce.Modules.Identity.Contracts;
using Ecommerce.Modules.Identity.Domain;
using Ecommerce.Modules.Identity.Infrastructure;
using Ecommerce.Shared.Infrastructure.Options;
using Ecommerce.Shared.Infrastructure.Security;
using Ecommerce.Shared.Kernel.Exceptions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace Ecommerce.Modules.Identity.Application;

public sealed class AuthService(
    IdentityDbContext db,
    IPasswordHasher passwordHasher,
    ITokenService tokenService,
    IOptions<JwtOptions> jwtOptions,
    IAuditLogService auditLog) : IAuthService
{
    private readonly JwtOptions _jwtOptions = jwtOptions.Value;

    public async Task<AuthResponse> RegisterAsync(RegisterRequest request, CancellationToken cancellationToken)
    {
        var normalizedEmail = request.Email.Trim().ToLowerInvariant();

        var exists = await db.Users.AnyAsync(u => u.Email == normalizedEmail, cancellationToken);
        if (exists)
        {
            throw new ConflictException($"A user with email '{normalizedEmail}' already exists.");
        }

        var customerRole = await db.Roles.FirstOrDefaultAsync(r => r.NormalizedName == Role.WellKnown.Customer.ToUpperInvariant(), cancellationToken)
                            ?? throw new NotFoundException("Role", Role.WellKnown.Customer);

        var user = new User
        {
            Email = normalizedEmail,
            PasswordHash = passwordHasher.Hash(request.Password),
            FirstName = request.FirstName,
            LastName = request.LastName,
            PhoneNumber = request.PhoneNumber,
        };
        user.UserRoles.Add(new UserRole { UserId = user.Id, RoleId = customerRole.Id });

        db.Users.Add(user);
        await db.SaveChangesAsync(cancellationToken);

        return await IssueTokensAsync(user, [Role.WellKnown.Customer], cancellationToken);
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request, CancellationToken cancellationToken)
    {
        var normalizedEmail = request.Email.Trim().ToLowerInvariant();

        var user = await db.Users
            .Include(u => u.UserRoles).ThenInclude(ur => ur.Role)
            .FirstOrDefaultAsync(u => u.Email == normalizedEmail, cancellationToken);

        if (user is null || !user.IsActive || !passwordHasher.Verify(user.PasswordHash, request.Password))
        {
            throw new UnauthorizedAppException("Invalid email or password.");
        }

        var roles = user.UserRoles.Select(ur => ur.Role.Name).ToArray();

        if (roles.Contains(Role.WellKnown.Admin))
        {
            await auditLog.LogForActorAsync(user.Id, user.Email, "Auth.AdminLogin", "User", user.Id.ToString(), null, cancellationToken);
        }

        return await IssueTokensAsync(user, roles, cancellationToken);
    }

    public async Task<AuthResponse> RefreshAsync(RefreshTokenRequest request, CancellationToken cancellationToken)
    {
        var existingToken = await db.RefreshTokens
            .Include(rt => rt.User).ThenInclude(u => u.UserRoles).ThenInclude(ur => ur.Role)
            .FirstOrDefaultAsync(rt => rt.Token == request.RefreshToken, cancellationToken);

        if (existingToken is null || !existingToken.IsActive)
        {
            throw new UnauthorizedAppException("Invalid or expired refresh token.");
        }

        existingToken.RevokedAt = DateTimeOffset.UtcNow;

        var roles = existingToken.User.UserRoles.Select(ur => ur.Role.Name).ToArray();
        var response = await IssueTokensAsync(existingToken.User, roles, cancellationToken, persistRevocation: false);

        existingToken.ReplacedByToken = response.RefreshToken;
        await db.SaveChangesAsync(cancellationToken);

        return response;
    }

    public async Task<UserDto> GetCurrentUserAsync(Guid userId, CancellationToken cancellationToken)
    {
        var user = await db.Users
            .Include(u => u.UserRoles).ThenInclude(ur => ur.Role)
            .FirstOrDefaultAsync(u => u.Id == userId, cancellationToken)
            ?? throw new NotFoundException("User", userId);

        return ToDto(user, user.UserRoles.Select(ur => ur.Role.Name).ToArray());
    }

    private async Task<AuthResponse> IssueTokensAsync(User user, IReadOnlyList<string> roles, CancellationToken cancellationToken, bool persistRevocation = true)
    {
        var accessToken = tokenService.GenerateAccessToken(user.Id, user.Email, roles);
        var refreshTokenValue = tokenService.GenerateRefreshToken();
        var accessTokenExpiresAt = DateTimeOffset.UtcNow.AddMinutes(_jwtOptions.AccessTokenMinutes);

        db.RefreshTokens.Add(new RefreshToken
        {
            UserId = user.Id,
            Token = refreshTokenValue,
            ExpiresAt = DateTimeOffset.UtcNow.AddDays(_jwtOptions.RefreshTokenDays),
        });

        if (persistRevocation)
        {
            await db.SaveChangesAsync(cancellationToken);
        }

        return new AuthResponse(accessToken, refreshTokenValue, accessTokenExpiresAt, ToDto(user, roles));
    }

    private static UserDto ToDto(User user, IReadOnlyList<string> roles) =>
        new(user.Id, user.Email, user.FirstName, user.LastName, user.PhoneNumber, roles);
}
