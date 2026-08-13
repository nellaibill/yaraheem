using Microsoft.Extensions.Logging;

namespace Ecommerce.Shared.Infrastructure.Email;

/// <summary>
/// Default sender when no real SMTP provider is configured (Email:SmtpHost empty) — writes
/// the email to the application log instead of actually sending it, so flows like password
/// reset are fully exercisable in dev/pilot without a real mail account. Never used silently
/// in place of a working provider: RUNBOOK.md documents that Email:SmtpHost must be set
/// before go-live, exactly like Payments/SMS/WhatsApp providers.
/// </summary>
public sealed class LoggingEmailSender(ILogger<LoggingEmailSender> logger) : IEmailSender
{
    public Task SendAsync(string toAddress, string subject, string bodyText, CancellationToken cancellationToken)
    {
        logger.LogInformation(
            "No SMTP provider configured (Email:SmtpHost) — logging email instead of sending. To={ToAddress} Subject={Subject}\n{Body}",
            toAddress, subject, bodyText);
        return Task.CompletedTask;
    }
}
