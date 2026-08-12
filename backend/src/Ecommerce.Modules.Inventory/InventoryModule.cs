using Ecommerce.Modules.Inventory.Application;
using Ecommerce.Modules.Inventory.Infrastructure;
using Ecommerce.Modules.Inventory.Options;
using FluentValidation;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Ecommerce.Modules.Inventory;

public static class InventoryModule
{
    public static IServiceCollection AddInventoryModule(this IServiceCollection services, IConfiguration configuration)
    {
        services.Configure<InventoryOptions>(configuration.GetSection(InventoryOptions.SectionName));

        var connectionString = configuration.GetConnectionString("PostgreSql");

        services.AddDbContext<InventoryDbContext>(options =>
            options.UseNpgsql(connectionString, npgsql => npgsql
                .MigrationsHistoryTable("__ef_migrations_history", InventoryDbContext.Schema)
                .MigrationsAssembly("Ecommerce.Database.Migrations")));

        services.AddScoped<IInventoryService, InventoryService>();
        services.AddValidatorsFromAssemblyContaining(typeof(InventoryModule));

        return services;
    }
}
