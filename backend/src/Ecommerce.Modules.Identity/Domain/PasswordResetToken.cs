using Ecommerce.Shared.Kernel;

namespace Ecommerce.Modules.Identity.Domain;

public class PasswordResetToken : BaseEntity
{
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    /// <summary>SHA-256 hash of the token — the plaintext token is only ever in the email/response, never stored.</summary>
    public required string TokenHash { get; set; }
    public DateTimeOffset ExpiresAt { get; set; }
    public DateTimeOffset? UsedAt { get; set; }

    public bool IsActive => UsedAt is null && ExpiresAt > DateTimeOffset.UtcNow;
}
