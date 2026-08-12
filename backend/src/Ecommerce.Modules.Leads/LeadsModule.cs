using Ecommerce.Modules.Leads.Application;
using Ecommerce.Modules.Leads.Infrastructure;
using FluentValidation;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Ecommerce.Modules.Leads;

public static class LeadsModule
{
    public static IServiceCollection AddLeadsModule(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("PostgreSql");

        services.AddDbContext<LeadsDbContext>(options =>
            options.UseNpgsql(connectionString, npgsql => npgsql
                .MigrationsHistoryTable("__ef_migrations_history", LeadsDbContext.Schema)
                .MigrationsAssembly("Ecommerce.Database.Migrations")));

        services.AddScoped<ILeadsService, LeadsService>();
        services.AddValidatorsFromAssemblyContaining(typeof(LeadsModule));

        return services;
    }
}
