using Ecommerce.Modules.DineIn.Application;
using Ecommerce.Modules.DineIn.Infrastructure;
using FluentValidation;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Ecommerce.Modules.DineIn;

public static class DineInModule
{
    public static IServiceCollection AddDineInModule(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("PostgreSql");

        services.AddDbContext<DineInDbContext>(options =>
            options.UseNpgsql(connectionString, npgsql => npgsql
                .MigrationsHistoryTable("__ef_migrations_history", DineInDbContext.Schema)
                .MigrationsAssembly("Ecommerce.Database.Migrations")));

        services.AddScoped<ITableSessionService, TableSessionService>();
        services.AddValidatorsFromAssemblyContaining(typeof(DineInModule));

        return services;
    }
}
