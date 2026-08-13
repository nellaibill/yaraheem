using Ecommerce.Shared.Kernel;

namespace Ecommerce.Modules.Identity.Domain;

public class OtpChallenge : BaseEntity
{
    public required string PhoneNumber { get; set; }

    /// <summary>SHA-256 hash of the 6-digit code — the plaintext code is only ever in the SMS/response, never stored.</summary>
    public required string CodeHash { get; set; }
    public DateTimeOffset ExpiresAt { get; set; }
    public DateTimeOffset? VerifiedAt { get; set; }
    public int FailedAttempts { get; set; }

    public bool IsActive => VerifiedAt is null && ExpiresAt > DateTimeOffset.UtcNow && FailedAttempts < 5;
}
