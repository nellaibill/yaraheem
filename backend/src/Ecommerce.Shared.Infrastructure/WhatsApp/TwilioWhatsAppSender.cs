using System.Net.Http.Headers;
using System.Text;
using Ecommerce.Shared.Infrastructure.Options;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Ecommerce.Shared.Infrastructure.WhatsApp;

/// <summary>
/// Real sender against Twilio's Messages API (https://api.twilio.com/2010-04-01/Accounts/{Sid}/Messages.json)
/// with the "whatsapp:" channel prefix, used only when WhatsApp:TwilioAccountSid is configured
/// (see LoggingWhatsAppSender for the dev/pilot default).
///
/// WhatsApp Business rules: free-form text only works within a 24-hour window after the
/// customer last messaged the business number; outside that window (e.g. an unprompted order
/// update), Twilio requires a pre-approved Content Template instead of arbitrary Body text.
/// This sends plain Body text, which is correct for the sandbox and for replies within an
/// active session — sending unprompted production notifications reliably will likely need
/// templates. Verify against Twilio's current WhatsApp docs when wiring up real credentials.
/// </summary>
public sealed class TwilioWhatsAppSender(HttpClient httpClient, IOptions<WhatsAppOptions> options, ILogger<TwilioWhatsAppSender> logger) : IWhatsAppSender
{
    public async Task SendAsync(string toPhoneNumber, string message, CancellationToken cancellationToken)
    {
        var settings = options.Value;

        var form = new Dictionary<string, string>
        {
            ["From"] = settings.TwilioFromNumber ?? string.Empty,
            ["To"] = $"whatsapp:+91{toPhoneNumber}",
            ["Body"] = message,
        };

        using var request = new HttpRequestMessage(
            HttpMethod.Post,
            $"https://api.twilio.com/2010-04-01/Accounts/{settings.TwilioAccountSid}/Messages.json")
        {
            Content = new FormUrlEncodedContent(form),
        };
        request.Headers.Authorization = new AuthenticationHeaderValue(
            "Basic",
            Convert.ToBase64String(Encoding.UTF8.GetBytes($"{settings.TwilioAccountSid}:{settings.TwilioAuthToken}")));

        var response = await httpClient.SendAsync(request, cancellationToken);
        if (!response.IsSuccessStatusCode)
        {
            var body = await response.Content.ReadAsStringAsync(cancellationToken);
            logger.LogError("Twilio WhatsApp send failed. Status={Status} Body={Body}", response.StatusCode, body);
        }
    }
}
