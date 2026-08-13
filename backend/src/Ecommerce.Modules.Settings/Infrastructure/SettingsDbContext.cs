using Ecommerce.Modules.Settings.Domain;
using Ecommerce.Shared.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Modules.Settings.Infrastructure;

public class SettingsDbContext(DbContextOptions<SettingsDbContext> options) : AuditableDbContext(options)
{
    public const string Schema = "settings";

    public DbSet<IntegrationSetting> IntegrationSettings => Set<IntegrationSetting>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasDefaultSchema(Schema);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(SettingsDbContext).Assembly);
        modelBuilder.ApplySnakeCaseNames();
        base.OnModelCreating(modelBuilder);
    }
}
