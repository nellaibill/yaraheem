using Ecommerce.Modules.Delivery.Application;
using Ecommerce.Modules.Delivery.Infrastructure;
using FluentValidation;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Ecommerce.Modules.Delivery;

public static class DeliveryModule
{
    public static IServiceCollection AddDeliveryModule(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("PostgreSql");

        services.AddDbContext<DeliveryDbContext>(options =>
            options.UseNpgsql(connectionString, npgsql => npgsql
                .MigrationsHistoryTable("__ef_migrations_history", DeliveryDbContext.Schema)
                .MigrationsAssembly("Ecommerce.Database.Migrations")));

        services.AddScoped<IDeliveryService, DeliveryService>();
        services.AddScoped<IDeliveryAssignmentTransitionService, DeliveryAssignmentTransitionService>();
        services.AddValidatorsFromAssemblyContaining(typeof(DeliveryModule));

        return services;
    }
}
