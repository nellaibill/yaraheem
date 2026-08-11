using Ecommerce.Modules.Payments.Domain;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Ecommerce.Modules.Payments.Infrastructure.Configurations;

public sealed class PaymentTransactionConfiguration : IEntityTypeConfiguration<PaymentTransaction>
{
    public void Configure(EntityTypeBuilder<PaymentTransaction> builder)
    {
        builder.ToTable("payment_transactions");
        builder.HasKey(p => p.Id);

        builder.Property(p => p.PaymentProvider).IsRequired().HasMaxLength(50);
        builder.Property(p => p.PaymentMethod).IsRequired().HasMaxLength(30);
        builder.Property(p => p.TransactionReference).IsRequired().HasMaxLength(100);
        builder.Property(p => p.Amount).HasColumnType("numeric(18,2)");
        builder.Property(p => p.Currency).IsRequired().HasMaxLength(10).HasDefaultValue("INR");
        builder.Property(p => p.Status).HasConversion<string>().HasMaxLength(30);
        builder.Property(p => p.ProviderResponse).HasColumnType("text");

        builder.HasIndex(p => p.OrderId).HasDatabaseName("ix_payment_transactions_order_id");
        builder.HasIndex(p => p.TransactionReference).HasDatabaseName("ix_payment_transactions_transaction_reference");
        builder.HasIndex(p => p.Status).HasDatabaseName("ix_payment_transactions_status");
    }
}
