using Ecommerce.Modules.DineIn.Domain;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Ecommerce.Modules.DineIn.Infrastructure.Configurations;

public sealed class DiningTableConfiguration : IEntityTypeConfiguration<DiningTable>
{
    public void Configure(EntityTypeBuilder<DiningTable> builder)
    {
        builder.ToTable("dining_tables");
        builder.HasKey(e => e.Id);
        builder.Property(e => e.Label).IsRequired().HasMaxLength(50);
        builder.HasIndex(e => e.Label).IsUnique();
    }
}

public sealed class TableSessionConfiguration : IEntityTypeConfiguration<TableSession>
{
    public void Configure(EntityTypeBuilder<TableSession> builder)
    {
        builder.ToTable("table_sessions");
        builder.HasKey(e => e.Id);
        builder.Property(e => e.PaymentMethod).HasMaxLength(20);
        builder.Property(e => e.TotalAmount).HasPrecision(10, 2);

        builder.HasOne<DiningTable>().WithMany().HasForeignKey(e => e.TableId).OnDelete(DeleteBehavior.Restrict);
        builder.HasMany(e => e.Rounds).WithOne().HasForeignKey(r => r.TableSessionId).OnDelete(DeleteBehavior.Cascade);
        builder.HasMany(e => e.Payments).WithOne().HasForeignKey(p => p.TableSessionId).OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(e => e.TableId);
        builder.HasIndex(e => e.Status);
    }
}

public sealed class DineInRoundConfiguration : IEntityTypeConfiguration<DineInRound>
{
    public void Configure(EntityTypeBuilder<DineInRound> builder)
    {
        builder.ToTable("dine_in_rounds");
        builder.HasKey(e => e.Id);
        builder.HasMany(e => e.Items).WithOne().HasForeignKey(i => i.DineInRoundId).OnDelete(DeleteBehavior.Cascade);
        builder.HasIndex(e => e.TableSessionId);
    }
}

public sealed class DineInRoundItemConfiguration : IEntityTypeConfiguration<DineInRoundItem>
{
    public void Configure(EntityTypeBuilder<DineInRoundItem> builder)
    {
        builder.ToTable("dine_in_round_items");
        builder.HasKey(e => e.Id);
        builder.Property(e => e.ProductName).IsRequired().HasMaxLength(200);
        builder.Property(e => e.UnitPrice).HasPrecision(10, 2);
        builder.HasIndex(e => e.DineInRoundId);
    }
}

public sealed class DineInPaymentConfiguration : IEntityTypeConfiguration<DineInPayment>
{
    public void Configure(EntityTypeBuilder<DineInPayment> builder)
    {
        builder.ToTable("dine_in_payments");
        builder.HasKey(e => e.Id);
        builder.Property(e => e.Label).IsRequired().HasMaxLength(50);
        builder.Property(e => e.Amount).HasPrecision(10, 2);
        builder.Property(e => e.Method).IsRequired().HasMaxLength(20);
        builder.Property(e => e.RazorpayOrderId).HasMaxLength(100);
        builder.Property(e => e.RazorpayPaymentId).HasMaxLength(100);
        builder.HasIndex(e => e.TableSessionId);
    }
}
