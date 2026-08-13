namespace Ecommerce.Modules.Identity.Contracts;

public sealed record RegisterRequest(string Email, string Password, string FirstName, string LastName, string? PhoneNumber);

public sealed record LoginRequest(string Email, string Password);

public sealed record RefreshTokenRequest(string RefreshToken);

public sealed record AuthResponse(string AccessToken, string RefreshToken, DateTimeOffset AccessTokenExpiresAt, UserDto User);

public sealed record UserDto(Guid Id, string Email, string FirstName, string LastName, string? PhoneNumber, IReadOnlyList<string> Roles);

public sealed record ForgotPasswordRequest(string Email);

public sealed record ForgotPasswordResponse(
    /// <summary>Only populated outside Production, so local/dev testing doesn't need a real mailbox. Never sent in Production.</summary>
    string? DevOnlyResetToken);

public sealed record ResetPasswordRequest(string Token, string NewPassword);
