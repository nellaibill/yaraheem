using Ecommerce.Modules.Identity.Contracts;

namespace Ecommerce.Modules.Identity.Application;

public interface IAuthService
{
    Task<AuthResponse> RegisterAsync(RegisterRequest request, CancellationToken cancellationToken);
    Task<AuthResponse> LoginAsync(LoginRequest request, CancellationToken cancellationToken);
    Task<AuthResponse> RefreshAsync(RefreshTokenRequest request, CancellationToken cancellationToken);
    Task<UserDto> GetCurrentUserAsync(Guid userId, CancellationToken cancellationToken);

    /// <summary>
    /// Always succeeds regardless of whether the email exists, so callers can't use this to
    /// enumerate accounts. DevOnlyResetToken is populated only outside Production.
    /// </summary>
    Task<ForgotPasswordResponse> ForgotPasswordAsync(string email, CancellationToken cancellationToken);

    Task ResetPasswordAsync(string token, string newPassword, CancellationToken cancellationToken);
}
