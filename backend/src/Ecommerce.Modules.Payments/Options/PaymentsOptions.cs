namespace Ecommerce.Modules.Payments.Options;

public sealed class PaymentsOptions
{
    public const string SectionName = "Payments";

    /// <summary>
    /// Shared HMAC-SHA256 secret used to verify POST /api/payments/webhook calls. No default
    /// on purpose — an empty value means the webhook rejects every request rather than
    /// silently trusting an unsigned caller. Supply via user-secrets (dev) or the
    /// Payments__WebhookSecret environment variable.
    /// </summary>
    public string WebhookSecret { get; set; } = string.Empty;
}
