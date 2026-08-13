namespace Ecommerce.Modules.Payments.Options;

public sealed class RazorpayOptions
{
    public const string SectionName = "Razorpay";

    /// <summary>Empty/unset means no real gateway is configured — checkout falls back to the dummy simulator for ONLINE payments too.</summary>
    public string? KeyId { get; set; }
    public string? KeySecret { get; set; }

    /// <summary>Separate secret configured in the Razorpay Dashboard for the webhook endpoint — not the same as KeySecret.</summary>
    public string? WebhookSecret { get; set; }
}
