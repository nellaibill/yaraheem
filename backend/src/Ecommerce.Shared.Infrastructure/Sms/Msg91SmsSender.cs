using System.Net.Http.Json;
using Ecommerce.Shared.Infrastructure.Options;
using Ecommerce.Shared.Infrastructure.Settings;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Ecommerce.Shared.Infrastructure.Sms;

/// <summary>
/// Sender against MSG91's Flow API (https://control.msg91.com/api/v5/flow). Credentials are
/// resolved per call: a database override set via the admin Integration Settings page (see
/// IIntegrationSettingsStore) takes precedence, falling back to Sms:* in appsettings/user-secrets.
/// If no API key is available from either source, the message is written to the application log
/// instead of sent — this is the only sender registered for ISmsSender, so OTP/order-status
/// texts are always exercisable even with nothing configured.
///
/// India requires DLT-registered templates for transactional SMS — this can't send arbitrary
/// free text. The resolved template must have a single variable (named "VAR1" below); the
/// caller's message text is passed as that variable's value. Verify the exact request shape
/// against MSG91's current API docs when wiring up real credentials — provider APIs change over
/// time and this hasn't been exercised against a live account.
/// </summary>
public sealed class Msg91SmsSender(
    HttpClient httpClient,
    IOptions<SmsOptions> options,
    IIntegrationSettingsStore settingsStore,
    ILogger<Msg91SmsSender> logger) : ISmsSender
{
    public async Task SendAsync(string toPhoneNumber, string message, CancellationToken cancellationToken)
    {
        var configured = options.Value;

        var apiKey = await settingsStore.GetOverrideAsync("Sms:Msg91ApiKey", cancellationToken) ?? configured.Msg91ApiKey;
        if (string.IsNullOrWhiteSpace(apiKey))
        {
            logger.LogInformation(
                "No SMS provider configured (Sms:Msg91ApiKey) — logging SMS instead of sending. To={ToPhoneNumber}\n{Message}",
                toPhoneNumber, message);
            return;
        }

        var templateId = await settingsStore.GetOverrideAsync("Sms:Msg91TemplateId", cancellationToken) ?? configured.Msg91TemplateId;
        var senderId = await settingsStore.GetOverrideAsync("Sms:Msg91SenderId", cancellationToken) ?? configured.Msg91SenderId;

        var payload = new
        {
            template_id = templateId,
            sender = senderId,
            short_url = "0",
            mobiles = $"91{toPhoneNumber}",
            VAR1 = message,
        };

        using var request = new HttpRequestMessage(HttpMethod.Post, "https://control.msg91.com/api/v5/flow")
        {
            Content = JsonContent.Create(payload),
        };
        request.Headers.Add("authkey", apiKey);

        var response = await httpClient.SendAsync(request, cancellationToken);
        if (!response.IsSuccessStatusCode)
        {
            var body = await response.Content.ReadAsStringAsync(cancellationToken);
            logger.LogError("MSG91 SMS send failed. Status={Status} Body={Body}", response.StatusCode, body);
        }
    }
}
