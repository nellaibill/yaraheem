using Ecommerce.Shared.Kernel;

namespace Ecommerce.Modules.Settings.Domain;

/// <summary>
/// One admin-configured override for a third-party integration credential, e.g. "Sms:Msg91ApiKey".
/// Key matches the corresponding IConfiguration key so it can shadow the same-named appsettings/
/// user-secrets value. EncryptedValue is protected at rest via ASP.NET Core Data Protection —
/// never stored or logged in plaintext.
/// </summary>
public sealed class IntegrationSetting : BaseEntity
{
    public required string Key { get; set; }
    public required string EncryptedValue { get; set; }
    public Guid? UpdatedByUserId { get; set; }
    public string? UpdatedByEmail { get; set; }
}
