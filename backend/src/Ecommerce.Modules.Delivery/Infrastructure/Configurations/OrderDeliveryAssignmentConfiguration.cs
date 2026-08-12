using Ecommerce.Modules.Delivery.Domain;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Ecommerce.Modules.Delivery.Infrastructure.Configurations;

public sealed class OrderDeliveryAssignmentConfiguration : IEntityTypeConfiguration<OrderDeliveryAssignment>
{
    public void Configure(EntityTypeBuilder<OrderDeliveryAssignment> builder)
    {
        builder.ToTable("order_delivery_assignments");
        builder.HasKey(a => a.Id);

        builder.Property(a => a.Status).HasConversion<string>().HasMaxLength(20);

        builder.HasIndex(a => a.OrderId).IsUnique().HasDatabaseName("ix_order_delivery_assignments_order_id");
        builder.HasIndex(a => a.DeliveryPartnerId).HasDatabaseName("ix_order_delivery_assignments_delivery_partner_id");
    }
}
