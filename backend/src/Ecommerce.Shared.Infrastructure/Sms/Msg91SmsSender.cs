using System.Net.Http.Json;
using Ecommerce.Shared.Infrastructure.Options;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Ecommerce.Shared.Infrastructure.Sms;

/// <summary>
/// Real sender against MSG91's Flow API (https://control.msg91.com/api/v5/flow), used only
/// when Sms:Msg91ApiKey is configured (see LoggingSmsSender for the dev/pilot default).
///
/// India requires DLT-registered templates for transactional SMS — this can't send arbitrary
/// free text. Sms:Msg91TemplateId must point at a template in the MSG91 account with a single
/// variable (named "VAR1" below); the caller's message text is passed as that variable's value,
/// so the template itself should be something generic like "{{VAR1}}". Verify the exact request
/// shape against MSG91's current API docs when wiring up real credentials — provider APIs
/// change over time and this hasn't been exercised against a live account.
/// </summary>
public sealed class Msg91SmsSender(HttpClient httpClient, IOptions<SmsOptions> options, ILogger<Msg91SmsSender> logger) : ISmsSender
{
    public async Task SendAsync(string toPhoneNumber, string message, CancellationToken cancellationToken)
    {
        var settings = options.Value;

        var payload = new
        {
            template_id = settings.Msg91TemplateId,
            sender = settings.Msg91SenderId,
            short_url = "0",
            mobiles = $"91{toPhoneNumber}",
            VAR1 = message,
        };

        using var request = new HttpRequestMessage(HttpMethod.Post, "https://control.msg91.com/api/v5/flow")
        {
            Content = JsonContent.Create(payload),
        };
        request.Headers.Add("authkey", settings.Msg91ApiKey);

        var response = await httpClient.SendAsync(request, cancellationToken);
        if (!response.IsSuccessStatusCode)
        {
            var body = await response.Content.ReadAsStringAsync(cancellationToken);
            logger.LogError("MSG91 SMS send failed. Status={Status} Body={Body}", response.StatusCode, body);
        }
    }
}
