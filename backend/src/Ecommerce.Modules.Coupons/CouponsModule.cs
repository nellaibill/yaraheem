using Ecommerce.Modules.Coupons.Application;
using Ecommerce.Modules.Coupons.Infrastructure;
using FluentValidation;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Ecommerce.Modules.Coupons;

public static class CouponsModule
{
    public static IServiceCollection AddCouponsModule(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("PostgreSql");

        services.AddDbContext<CouponsDbContext>(options =>
            options.UseNpgsql(connectionString, npgsql => npgsql
                .MigrationsHistoryTable("__ef_migrations_history", CouponsDbContext.Schema)
                .MigrationsAssembly("Ecommerce.Database.Migrations")));

        services.AddScoped<ICouponService, CouponService>();
        services.AddValidatorsFromAssemblyContaining(typeof(CouponsModule));

        return services;
    }
}
