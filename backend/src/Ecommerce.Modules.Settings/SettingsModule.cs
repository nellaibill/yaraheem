using Ecommerce.Modules.Settings.Application;
using Ecommerce.Modules.Settings.Infrastructure;
using Ecommerce.Shared.Infrastructure.Settings;
using Microsoft.AspNetCore.DataProtection;
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

        // Data Protection's key ring must survive container restarts/redeploys, or every
        // encrypted override in integration_settings becomes permanently undecryptable the
        // moment the container is recreated. DataProtection:KeyPath (set to /app/keys, a
        // volume-mounted directory — see backend/Dockerfile and docker-compose.yml) makes the
        // path explicit and stable instead of relying on the default OS-profile location, which
        // isn't guaranteed to persist across container recreation. Falls back to the default
        // (in-memory-adjacent, framework-chosen) location when unset, e.g. in local dev.
        var dataProtection = services.AddDataProtection().SetApplicationName("Ecommerce.Api");
        var keyPath = configuration["DataProtection:KeyPath"];
        if (!string.IsNullOrWhiteSpace(keyPath))
        {
            dataProtection.PersistKeysToFileSystem(new DirectoryInfo(keyPath));
        }
        services.AddMemoryCache();
        services.AddScoped<IIntegrationSettingsStore, IntegrationSettingsStore>();

        return services;
    }
}
