using Ecommerce.Modules.Settings.Domain;
using Ecommerce.Modules.Settings.Infrastructure;
using Ecommerce.Shared.Infrastructure.Settings;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;

namespace Ecommerce.Modules.Settings.Application;

/// <summary>
/// EF-backed IIntegrationSettingsStore. Values are encrypted at rest with ASP.NET Core Data
/// Protection and cached in memory for a short window so senders (which check for an override
/// on every send) don't hit the database each time; SetOverrideAsync evicts the cache entry
/// immediately so a change made in the admin UI takes effect on the very next call.
/// </summary>
public sealed class IntegrationSettingsStore(SettingsDbContext db, IDataProtectionProvider dataProtectionProvider, IMemoryCache cache) : IIntegrationSettingsStore
{
    private const string CacheKeyPrefix = "integration-setting:";
    private static readonly TimeSpan CacheDuration = TimeSpan.FromSeconds(30);

    private readonly IDataProtector protector = dataProtectionProvider.CreateProtector("Ecommerce.Modules.Settings.IntegrationSettings");

    public async Task<string?> GetOverrideAsync(string key, CancellationToken cancellationToken)
    {
        var cacheKey = CacheKeyPrefix + key;
        if (cache.TryGetValue(cacheKey, out string? cached))
        {
            return cached;
        }

        var entity = await db.IntegrationSettings.AsNoTracking().FirstOrDefaultAsync(s => s.Key == key, cancellationToken);
        var value = entity is null ? null : protector.Unprotect(entity.EncryptedValue);

        cache.Set(cacheKey, value, CacheDuration);
        return value;
    }

    public async Task SetOverrideAsync(string key, string? value, Guid? updatedByUserId, string? updatedByEmail, CancellationToken cancellationToken)
    {
        var entity = await db.IntegrationSettings.FirstOrDefaultAsync(s => s.Key == key, cancellationToken);

        if (string.IsNullOrEmpty(value))
        {
            if (entity is not null)
            {
                db.IntegrationSettings.Remove(entity);
                await db.SaveChangesAsync(cancellationToken);
            }
        }
        else
        {
            var encrypted = protector.Protect(value);
            if (entity is null)
            {
                db.IntegrationSettings.Add(new IntegrationSetting
                {
                    Key = key,
                    EncryptedValue = encrypted,
                    UpdatedByUserId = updatedByUserId,
                    UpdatedByEmail = updatedByEmail,
                });
            }
            else
            {
                entity.EncryptedValue = encrypted;
                entity.UpdatedByUserId = updatedByUserId;
                entity.UpdatedByEmail = updatedByEmail;
                entity.UpdatedAt = DateTimeOffset.UtcNow;
            }

            await db.SaveChangesAsync(cancellationToken);
        }

        cache.Remove(CacheKeyPrefix + key);
    }
}
