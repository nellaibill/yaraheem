using Ecommerce.Modules.Delivery.Domain;
using Ecommerce.Shared.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Modules.Delivery.Infrastructure;

public class DeliveryDbContext(DbContextOptions<DeliveryDbContext> options) : AuditableDbContext(options)
{
    public const string Schema = "delivery";

    public DbSet<DeliveryPartner> DeliveryPartners => Set<DeliveryPartner>();
    public DbSet<OrderDeliveryAssignment> OrderDeliveryAssignments => Set<OrderDeliveryAssignment>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasDefaultSchema(Schema);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(DeliveryDbContext).Assembly);
        modelBuilder.ApplySnakeCaseNames();
        base.OnModelCreating(modelBuilder);
    }
}
