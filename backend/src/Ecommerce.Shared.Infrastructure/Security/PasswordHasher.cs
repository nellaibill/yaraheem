using Microsoft.AspNetCore.Identity;

namespace Ecommerce.Shared.Infrastructure.Security;

internal sealed class PasswordHasherMarker
{
}

public sealed class PasswordHasher : IPasswordHasher
{
    private readonly PasswordHasher<PasswordHasherMarker> _inner = new();

    public string Hash(string password) => _inner.HashPassword(new PasswordHasherMarker(), password);

    public bool Verify(string hashedPassword, string providedPassword) =>
        _inner.VerifyHashedPassword(new PasswordHasherMarker(), hashedPassword, providedPassword)
            is PasswordVerificationResult.Success or PasswordVerificationResult.SuccessRehashNeeded;
}
