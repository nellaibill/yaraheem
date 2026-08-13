using Microsoft.Extensions.Logging;

namespace Ecommerce.Shared.Infrastructure.Sms;

/// <summary>
/// Default sender when no real SMS provider is configured (Sms:Msg91ApiKey empty) — writes
/// the message to the application log instead of actually sending it, so OTP login and order
/// notifications are fully exercisable in dev/pilot without a real MSG91 account. RUNBOOK.md
/// documents that Sms:Msg91ApiKey must be set before go-live.
/// </summary>
public sealed class LoggingSmsSender(ILogger<LoggingSmsSender> logger) : ISmsSender
{
    public Task SendAsync(string toPhoneNumber, string message, CancellationToken cancellationToken)
    {
        logger.LogInformation(
            "No SMS provider configured (Sms:Msg91ApiKey) — logging SMS instead of sending. To={ToPhoneNumber}\n{Message}",
            toPhoneNumber, message);
        return Task.CompletedTask;
    }
}
