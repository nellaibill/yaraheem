using Ecommerce.Modules.Audit.Application;
using Ecommerce.Modules.Audit.Infrastructure;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Ecommerce.Modules.Audit;

public static class AuditModule
{
    public static IServiceCollection AddAuditModule(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("PostgreSql");

        services.AddDbContext<AuditDbContext>(options =>
            options.UseNpgsql(connectionString, npgsql => npgsql
                .MigrationsHistoryTable("__ef_migrations_history", AuditDbContext.Schema)
                .MigrationsAssembly("Ecommerce.Database.Migrations")));

        services.AddScoped<IAuditLogService, AuditLogService>();

        return services;
    }
}
