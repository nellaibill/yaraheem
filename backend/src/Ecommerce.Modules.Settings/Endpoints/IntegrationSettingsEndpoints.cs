using Ecommerce.Modules.Audit.Application;
using Ecommerce.Modules.Settings.Contracts;
using Ecommerce.Shared.Infrastructure.Security;
using Ecommerce.Shared.Infrastructure.Settings;
using Ecommerce.Shared.Kernel;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.Configuration;

namespace Ecommerce.Modules.Settings.Endpoints;

public static class IntegrationSettingsEndpoints
{
    // Key must match the corresponding IConfiguration key so a database override shadows the
    // same-named appsettings/user-secrets value. Keeping this list here (rather than an
    // IOptions<T> per provider) means this module never has to reference Payments or any other
    // business module just to know these three providers' field names.
    private static readonly (string Provider, string Title, (string Key, string Label)[] Fields)[] Groups =
    [
        ("sms", "SMS (MSG91)",
        [
            ("Sms:Msg91ApiKey", "Auth Key"),
            ("Sms:Msg91TemplateId", "DLT Template ID"),
            ("Sms:Msg91SenderId", "Sender ID"),
        ]),
        ("whatsapp", "WhatsApp (Twilio)",
        [
            ("WhatsApp:TwilioAccountSid", "Account SID"),
            ("WhatsApp:TwilioAuthToken", "Auth Token"),
            ("WhatsApp:TwilioFromNumber", "From Number"),
        ]),
        ("razorpay", "Payment Gateway (Razorpay)",
        [
            ("Razorpay:KeyId", "Key ID"),
            ("Razorpay:KeySecret", "Key Secret"),
            ("Razorpay:WebhookSecret", "Webhook Secret"),
        ]),
    ];

    private static readonly HashSet<string> KnownKeys = Groups.SelectMany(g => g.Fields.Select(f => f.Key)).ToHashSet();

    public static IEndpointRouteBuilder MapAdminIntegrationSettingsEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/admin/settings/integrations").WithTags("IntegrationSettings").RequireAuthorization("AdminOnly");

        group.MapGet("/", async (
            IIntegrationSettingsStore store,
            IConfiguration configuration,
            CancellationToken cancellationToken) =>
        {
            var groupDtos = new List<IntegrationSettingsGroupDto>();

            foreach (var (provider, title, fields) in Groups)
            {
                var fieldDtos = new List<IntegrationSettingFieldDto>();
                foreach (var (key, label) in fields)
                {
                    var dbValue = await store.GetOverrideAsync(key, cancellationToken);
                    var configValue = configuration[key];

                    var (source, effective) = dbValue is not null
                        ? (IntegrationSettingSource.Database, dbValue)
                        : configValue is not null
                            ? (IntegrationSettingSource.Config, configValue)
                            : (IntegrationSettingSource.NotConfigured, (string?)null);

                    fieldDtos.Add(new IntegrationSettingFieldDto(key, label, source, Mask(effective)));
                }

                groupDtos.Add(new IntegrationSettingsGroupDto(provider, title, fieldDtos));
            }

            return Results.Ok(ApiResponse<IntegrationSettingsResponse>.SuccessResponse(new IntegrationSettingsResponse(groupDtos)));
        }).WithSummary("Status of every configurable SMS/WhatsApp/payment-gateway credential. Values are always masked — never returned in plaintext.");

        group.MapPut("/", async (
            UpdateIntegrationSettingsRequest request,
            IIntegrationSettingsStore store,
            IAuditLogService auditLog,
            ICurrentUser currentUser,
            CancellationToken cancellationToken) =>
        {
            var unknownKeys = request.Values.Keys.Where(k => !KnownKeys.Contains(k)).ToList();
            if (unknownKeys.Count > 0)
            {
                return Results.BadRequest(new ApiResponse<object?>(false, $"Unknown setting key(s): {string.Join(", ", unknownKeys)}", null));
            }

            foreach (var (key, value) in request.Values)
            {
                if (value is null)
                {
                    continue;
                }

                await store.SetOverrideAsync(key, value, currentUser.UserId, currentUser.Email, cancellationToken);
                await auditLog.LogAsync(
                    value.Length == 0 ? "IntegrationSettings.Cleared" : "IntegrationSettings.Updated",
                    "IntegrationSetting",
                    key,
                    null,
                    cancellationToken);
            }

            return Results.Ok(ApiResponse<object>.SuccessResponse(new { }));
        }).WithSummary("Set or clear database overrides for SMS/WhatsApp/payment-gateway credentials. Omit a key to leave it unchanged; send an empty string to clear an override.");

        return app;
    }

    private static string? Mask(string? value)
    {
        if (string.IsNullOrEmpty(value))
        {
            return null;
        }

        return value.Length <= 4 ? "••••" : $"••••{value[^4..]}";
    }
}
