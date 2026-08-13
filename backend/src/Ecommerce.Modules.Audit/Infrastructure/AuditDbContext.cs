using Ecommerce.Modules.Audit.Domain;
using Ecommerce.Shared.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Modules.Audit.Infrastructure;

public class AuditDbContext(DbContextOptions<AuditDbContext> options) : AuditableDbContext(options)
{
    public const string Schema = "audit";

    public DbSet<AuditLogEntry> AuditLogEntries => Set<AuditLogEntry>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasDefaultSchema(Schema);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AuditDbContext).Assembly);
        modelBuilder.ApplySnakeCaseNames();
        base.OnModelCreating(modelBuilder);
    }
}
