namespace Ecommerce.Shared.Infrastructure.Settings;

/// <summary>
/// Database-backed overrides for third-party integration credentials (SMS/WhatsApp/payment
/// gateway), so an admin can set/rotate them from the admin UI instead of editing appsettings
/// or user-secrets on the server. Senders/gateways treat a stored override as taking precedence
/// over their IOptions&lt;T&gt; config value; an absent override means "use the config value."
/// The concrete implementation lives in Ecommerce.Modules.Settings and is wired up in the
/// composition root — this interface lives here (below all modules) so Shared.Infrastructure's
/// senders can depend on it without Shared.Infrastructure taking a dependency on a module.
/// </summary>
public interface IIntegrationSettingsStore
{
    /// <summary>Returns the decrypted override value for <paramref name="key"/>, or null if no override is stored.</summary>
    Task<string?> GetOverrideAsync(string key, CancellationToken cancellationToken);

    /// <summary>Stores an encrypted override for <paramref name="key"/>. A null/empty <paramref name="value"/> removes the override.</summary>
    Task SetOverrideAsync(string key, string? value, Guid? updatedByUserId, string? updatedByEmail, CancellationToken cancellationToken);
}
