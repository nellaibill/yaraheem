using System.Net.Http.Headers;
using System.Text;
using Ecommerce.Shared.Infrastructure.Options;
using Ecommerce.Shared.Infrastructure.Settings;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Ecommerce.Shared.Infrastructure.WhatsApp;

/// <summary>
/// Sender against Twilio's Messages API (https://api.twilio.com/2010-04-01/Accounts/{Sid}/Messages.json)
/// with the "whatsapp:" channel prefix. Credentials are resolved per call: a database override
/// set via the admin Integration Settings page (see IIntegrationSettingsStore) takes precedence,
/// falling back to WhatsApp:* in appsettings/user-secrets. If no account SID is available from
/// either source, the message is written to the application log instead of sent — this is the
/// only sender registered for IWhatsAppSender, so order notifications are always exercisable
/// even with nothing configured.
///
/// WhatsApp Business rules: free-form text only works within a 24-hour window after the
/// customer last messaged the business number; outside that window (e.g. an unprompted order
/// update), Twilio requires a pre-approved Content Template instead of arbitrary Body text.
/// This sends plain Body text, which is correct for the sandbox and for replies within an
/// active session — sending unprompted production notifications reliably will likely need
/// templates. Verify against Twilio's current WhatsApp docs when wiring up real credentials.
/// </summary>
public sealed class TwilioWhatsAppSender(
    HttpClient httpClient,
    IOptions<WhatsAppOptions> options,
    IIntegrationSettingsStore settingsStore,
    ILogger<TwilioWhatsAppSender> logger) : IWhatsAppSender
{
    public async Task SendAsync(string toPhoneNumber, string message, CancellationToken cancellationToken)
    {
        var configured = options.Value;

        var accountSid = await settingsStore.GetOverrideAsync("WhatsApp:TwilioAccountSid", cancellationToken) ?? configured.TwilioAccountSid;
        if (string.IsNullOrWhiteSpace(accountSid))
        {
            logger.LogInformation(
                "No WhatsApp provider configured (WhatsApp:TwilioAccountSid) — logging WhatsApp message instead of sending. To={ToPhoneNumber}\n{Message}",
                toPhoneNumber, message);
            return;
        }

        var authToken = await settingsStore.GetOverrideAsync("WhatsApp:TwilioAuthToken", cancellationToken) ?? configured.TwilioAuthToken;
        var fromNumber = await settingsStore.GetOverrideAsync("WhatsApp:TwilioFromNumber", cancellationToken) ?? configured.TwilioFromNumber;

        var form = new Dictionary<string, string>
        {
            ["From"] = fromNumber ?? string.Empty,
            ["To"] = $"whatsapp:+91{toPhoneNumber}",
            ["Body"] = message,
        };

        using var request = new HttpRequestMessage(
            HttpMethod.Post,
            $"https://api.twilio.com/2010-04-01/Accounts/{accountSid}/Messages.json")
        {
            Content = new FormUrlEncodedContent(form),
        };
        request.Headers.Authorization = new AuthenticationHeaderValue(
            "Basic",
            Convert.ToBase64String(Encoding.UTF8.GetBytes($"{accountSid}:{authToken}")));

        var response = await httpClient.SendAsync(request, cancellationToken);
        if (!response.IsSuccessStatusCode)
        {
            var body = await response.Content.ReadAsStringAsync(cancellationToken);
            logger.LogError("Twilio WhatsApp send failed. Status={Status} Body={Body}", response.StatusCode, body);
        }
    }
}
