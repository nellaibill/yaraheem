namespace Ecommerce.Modules.Settings.Contracts;

/// <summary>Source of the effective value: an admin-set database override, a fallback from appsettings/user-secrets, or neither.</summary>
public enum IntegrationSettingSource
{
    NotConfigured = 0,
    Config = 1,
    Database = 2,
}

/// <summary>
/// Status of one credential field. Value is never returned in plaintext — MaskedValue shows only
/// the last 4 characters (e.g. "••••18P1") so an admin can confirm what's configured without the
/// raw secret ever leaving the server after it's been saved.
/// </summary>
public sealed record IntegrationSettingFieldDto(string Key, string Label, IntegrationSettingSource Source, string? MaskedValue);

public sealed record IntegrationSettingsGroupDto(string Provider, string Title, List<IntegrationSettingFieldDto> Fields);

public sealed record IntegrationSettingsResponse(List<IntegrationSettingsGroupDto> Groups);

/// <summary>
/// Keys present are updated; a null value leaves that field unchanged, an empty string clears
/// the database override (reverting to the appsettings/user-secrets value, if any).
/// </summary>
public sealed record UpdateIntegrationSettingsRequest(Dictionary<string, string?> Values);
