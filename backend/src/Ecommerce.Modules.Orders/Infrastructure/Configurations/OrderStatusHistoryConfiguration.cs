using Ecommerce.Modules.Orders.Domain;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Ecommerce.Modules.Orders.Infrastructure.Configurations;

public sealed class OrderStatusHistoryConfiguration : IEntityTypeConfiguration<OrderStatusHistory>
{
    public void Configure(EntityTypeBuilder<OrderStatusHistory> builder)
    {
        builder.ToTable("order_status_history");
        builder.HasKey(h => h.Id);

        builder.Property(h => h.PreviousStatus).HasConversion<string>().HasMaxLength(30);
        builder.Property(h => h.NewStatus).HasConversion<string>().HasMaxLength(30).IsRequired();
        builder.Property(h => h.Notes).HasColumnType("text");

        builder.HasOne(h => h.Order)
            .WithMany(o => o.StatusHistory)
            .HasForeignKey(h => h.OrderId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
