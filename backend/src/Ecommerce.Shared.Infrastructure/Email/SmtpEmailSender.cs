using System.Net;
using System.Net.Mail;
using Ecommerce.Shared.Infrastructure.Options;
using Microsoft.Extensions.Options;

namespace Ecommerce.Shared.Infrastructure.Email;

/// <summary>Real sender, used only when Email:SmtpHost is configured (see LoggingEmailSender for the dev/pilot default).</summary>
public sealed class SmtpEmailSender(IOptions<EmailOptions> options) : IEmailSender
{
    public async Task SendAsync(string toAddress, string subject, string bodyText, CancellationToken cancellationToken)
    {
        var settings = options.Value;

        using var client = new SmtpClient(settings.SmtpHost, settings.SmtpPort)
        {
            EnableSsl = settings.UseSsl,
        };

        if (!string.IsNullOrWhiteSpace(settings.SmtpUsername))
        {
            client.Credentials = new NetworkCredential(settings.SmtpUsername, settings.SmtpPassword);
        }

        using var message = new MailMessage
        {
            From = new MailAddress(settings.FromAddress, settings.FromName),
            Subject = subject,
            Body = bodyText,
            IsBodyHtml = false,
        };
        message.To.Add(toAddress);

        await client.SendMailAsync(message, cancellationToken);
    }
}
