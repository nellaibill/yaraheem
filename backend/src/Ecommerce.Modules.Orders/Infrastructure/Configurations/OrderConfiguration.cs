using Ecommerce.Modules.Orders.Domain;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Ecommerce.Modules.Orders.Infrastructure.Configurations;

public sealed class OrderConfiguration : IEntityTypeConfiguration<Order>
{
    public void Configure(EntityTypeBuilder<Order> builder)
    {
        builder.ToTable("orders");
        builder.HasKey(o => o.Id);

        builder.Property(o => o.OrderNumber).IsRequired().HasMaxLength(30);
        builder.HasIndex(o => o.OrderNumber).IsUnique();

        builder.Property(o => o.Status).HasConversion<string>().HasMaxLength(30);
        builder.Property(o => o.Subtotal).HasColumnType("numeric(12,2)");
        builder.Property(o => o.Total).HasColumnType("numeric(12,2)");

        builder.HasIndex(o => o.UserId);
        builder.HasIndex(o => o.Status);

        builder.HasOne(o => o.ShippingAddress)
            .WithOne(a => a.Order)
            .HasForeignKey<Address>(a => a.OrderId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
