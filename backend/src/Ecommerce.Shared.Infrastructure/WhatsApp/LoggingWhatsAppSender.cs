using Microsoft.Extensions.Logging;

namespace Ecommerce.Shared.Infrastructure.WhatsApp;

/// <summary>
/// Default sender when no real WhatsApp provider is configured (WhatsApp:TwilioAccountSid
/// empty) — writes the message to the application log instead of actually sending it, so
/// order notifications are fully exercisable in dev/pilot without a real Twilio account.
/// RUNBOOK.md documents that the Twilio WhatsApp settings must be set before go-live.
/// </summary>
public sealed class LoggingWhatsAppSender(ILogger<LoggingWhatsAppSender> logger) : IWhatsAppSender
{
    public Task SendAsync(string toPhoneNumber, string message, CancellationToken cancellationToken)
    {
        logger.LogInformation(
            "No WhatsApp provider configured (WhatsApp:TwilioAccountSid) — logging WhatsApp message instead of sending. To={ToPhoneNumber}\n{Message}",
            toPhoneNumber, message);
        return Task.CompletedTask;
    }
}
