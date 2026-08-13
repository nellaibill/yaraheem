namespace Ecommerce.Shared.Infrastructure.Options;

public sealed class WhatsAppOptions
{
    public const string SectionName = "WhatsApp";

    /// <summary>Empty/unset means no real WhatsApp provider is configured — LoggingWhatsAppSender is used instead.</summary>
    public string? TwilioAccountSid { get; set; }
    public string? TwilioAuthToken { get; set; }

    /// <summary>Twilio WhatsApp-enabled sender, e.g. "whatsapp:+14155238886" (their sandbox number, or your approved business number).</summary>
    public string? TwilioFromNumber { get; set; }
}
