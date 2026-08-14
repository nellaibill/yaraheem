using Ecommerce.Modules.DineIn.Domain;
using Ecommerce.Shared.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Modules.DineIn.Infrastructure;

public class DineInDbContext(DbContextOptions<DineInDbContext> options) : AuditableDbContext(options)
{
    public const string Schema = "dinein";

    public DbSet<DiningTable> DiningTables => Set<DiningTable>();
    public DbSet<TableSession> TableSessions => Set<TableSession>();
    public DbSet<DineInRound> DineInRounds => Set<DineInRound>();
    public DbSet<DineInRoundItem> DineInRoundItems => Set<DineInRoundItem>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasDefaultSchema(Schema);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(DineInDbContext).Assembly);
        modelBuilder.ApplySnakeCaseNames();
        base.OnModelCreating(modelBuilder);
    }
}
