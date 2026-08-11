using Ecommerce.Modules.Cart.Application;
using Ecommerce.Modules.Cart.Infrastructure;
using FluentValidation;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Ecommerce.Modules.Cart;

public static class CartModule
{
    public static IServiceCollection AddCartModule(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("PostgreSql");

        services.AddDbContext<CartDbContext>(options =>
            options.UseNpgsql(connectionString, npgsql => npgsql
                .MigrationsHistoryTable("__ef_migrations_history", CartDbContext.Schema)
                .MigrationsAssembly("Ecommerce.Database.Migrations")));

        services.AddScoped<ICartService, CartService>();
        services.AddValidatorsFromAssemblyContaining(typeof(CartModule));

        return services;
    }
}
