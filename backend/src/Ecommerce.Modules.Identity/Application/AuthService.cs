using System.Security.Cryptography;
using System.Text;
using Ecommerce.Modules.Audit.Application;
using Ecommerce.Modules.Identity.Contracts;
using Ecommerce.Modules.Identity.Domain;
using Ecommerce.Modules.Identity.Infrastructure;
using Ecommerce.Shared.Infrastructure.Email;
using Ecommerce.Shared.Infrastructure.Options;
using Ecommerce.Shared.Infrastructure.Security;
using Ecommerce.Shared.Kernel.Exceptions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Options;

namespace Ecommerce.Modules.Identity.Application;

public sealed class AuthService(
    IdentityDbContext db,
    IPasswordHasher passwordHasher,
    ITokenService tokenService,
    IOptions<JwtOptions> jwtOptions,
    IAuditLogService auditLog,
    IEmailSender emailSender,
    IHostEnvironment environment) : IAuthService
{
    private const int PasswordResetTokenExpiryMinutes = 60;

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

    public async Task<ForgotPasswordResponse> ForgotPasswordAsync(string email, CancellationToken cancellationToken)
    {
        var normalizedEmail = email.Trim().ToLowerInvariant();
        var user = await db.Users.FirstOrDefaultAsync(u => u.Email == normalizedEmail && u.IsActive, cancellationToken);

        // Same response shape whether or not the account exists — otherwise this endpoint
        // becomes a way to enumerate registered emails.
        if (user is null)
        {
            return new ForgotPasswordResponse(null);
        }

        var token = tokenService.GenerateRefreshToken();
        db.PasswordResetTokens.Add(new PasswordResetToken
        {
            UserId = user.Id,
            TokenHash = HashToken(token),
            ExpiresAt = DateTimeOffset.UtcNow.AddMinutes(PasswordResetTokenExpiryMinutes),
        });
        await db.SaveChangesAsync(cancellationToken);

        await emailSender.SendAsync(
            user.Email,
            "Reset your Ya Raheem password",
            $"Use this code to reset your password (expires in {PasswordResetTokenExpiryMinutes} minutes): {token}\n\n" +
            "If you didn't request this, you can ignore this email.",
            cancellationToken);

        return new ForgotPasswordResponse(environment.IsDevelopment() ? token : null);
    }

    public async Task ResetPasswordAsync(string token, string newPassword, CancellationToken cancellationToken)
    {
        var tokenHash = HashToken(token);
        var resetToken = await db.PasswordResetTokens
            .Include(t => t.User)
            .FirstOrDefaultAsync(t => t.TokenHash == tokenHash, cancellationToken);

        if (resetToken is null || !resetToken.IsActive)
        {
            throw new UnauthorizedAppException("This reset link is invalid or has expired. Request a new one.");
        }

        resetToken.User.PasswordHash = passwordHasher.Hash(newPassword);
        resetToken.UsedAt = DateTimeOffset.UtcNow;

        // Force re-login everywhere — a password reset almost always means the old password
        // was compromised or forgotten, so any existing session shouldn't stay trusted.
        var activeRefreshTokens = await db.RefreshTokens
            .Where(rt => rt.UserId == resetToken.UserId && rt.RevokedAt == null)
            .ToListAsync(cancellationToken);
        foreach (var refreshToken in activeRefreshTokens)
        {
            refreshToken.RevokedAt = DateTimeOffset.UtcNow;
        }

        await db.SaveChangesAsync(cancellationToken);

        await auditLog.LogForActorAsync(resetToken.UserId, resetToken.User.Email, "Auth.PasswordReset", "User", resetToken.UserId.ToString(), null, cancellationToken);
    }

    private static string HashToken(string token) => Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(token)));

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
