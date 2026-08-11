using Ecommerce.Modules.Identity.Contracts;

namespace Ecommerce.Modules.Identity.Application;

public interface IAuthService
{
    Task<AuthResponse> RegisterAsync(RegisterRequest request, CancellationToken cancellationToken);
    Task<AuthResponse> LoginAsync(LoginRequest request, CancellationToken cancellationToken);
    Task<AuthResponse> RefreshAsync(RefreshTokenRequest request, CancellationToken cancellationToken);
    Task<UserDto> GetCurrentUserAsync(Guid userId, CancellationToken cancellationToken);
}
