using Ecommerce.Modules.Settings.Application;
using Ecommerce.Modules.Settings.Infrastructure;
using Ecommerce.Shared.Infrastructure.Settings;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Ecommerce.Modules.Settings;

public static class SettingsModule
{
    public static IServiceCollection AddSettingsModule(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("PostgreSql");

        services.AddDbContext<SettingsDbContext>(options =>
            options.UseNpgsql(connectionString, npgsql => npgsql
                .MigrationsHistoryTable("__ef_migrations_history", SettingsDbContext.Schema)
                .MigrationsAssembly("Ecommerce.Database.Migrations")));

        // Data Protection persists its key ring to the local filesystem by default, which is
        // fine for a single-instance deployment (this project's current target) but means
        // encrypted overrides become unreadable if that key ring is lost — e.g. a container
        // redeployed without persistent storage, or scaling to multiple instances without a
        // shared key ring. Point PersistKeysToFileSystem/PersistKeysToDbContext etc. at shared
        // storage before running more than one instance.
        services.AddDataProtection();
        services.AddMemoryCache();
        services.AddScoped<IIntegrationSettingsStore, IntegrationSettingsStore>();

        return services;
    }
}
