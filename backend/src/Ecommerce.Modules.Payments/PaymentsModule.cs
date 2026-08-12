using Ecommerce.Modules.Payments.Application;
using Ecommerce.Modules.Payments.Infrastructure;
using Ecommerce.Modules.Payments.Options;
using FluentValidation;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Ecommerce.Modules.Payments;

public static class PaymentsModule
{
    public static IServiceCollection AddPaymentsModule(this IServiceCollection services, IConfiguration configuration)
    {
        services.Configure<PaymentsOptions>(configuration.GetSection(PaymentsOptions.SectionName));

        var connectionString = configuration.GetConnectionString("PostgreSql");

        services.AddDbContext<PaymentsDbContext>(options =>
            options.UseNpgsql(connectionString, npgsql => npgsql
                .MigrationsHistoryTable("__ef_migrations_history", PaymentsDbContext.Schema)
                .MigrationsAssembly("Ecommerce.Database.Migrations")));

        services.AddScoped<IPaymentService, DummyPaymentService>();
        services.AddScoped<IPaymentTransactionService, PaymentTransactionService>();
        services.AddValidatorsFromAssemblyContaining(typeof(PaymentsModule));

        return services;
    }
}
