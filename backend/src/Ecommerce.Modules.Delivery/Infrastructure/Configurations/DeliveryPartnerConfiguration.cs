using Ecommerce.Modules.Delivery.Domain;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Ecommerce.Modules.Delivery.Infrastructure.Configurations;

public sealed class DeliveryPartnerConfiguration : IEntityTypeConfiguration<DeliveryPartner>
{
    public void Configure(EntityTypeBuilder<DeliveryPartner> builder)
    {
        builder.ToTable("delivery_partners");
        builder.HasKey(p => p.Id);

        builder.Property(p => p.Name).IsRequired().HasMaxLength(150);
        builder.Property(p => p.PhoneNumber).IsRequired().HasMaxLength(20);
        builder.Property(p => p.VehicleType).IsRequired().HasMaxLength(30);
        builder.Property(p => p.Status).HasConversion<string>().HasMaxLength(20);

        builder.HasIndex(p => p.UserId).IsUnique().HasDatabaseName("ix_delivery_partners_user_id");
    }
}
