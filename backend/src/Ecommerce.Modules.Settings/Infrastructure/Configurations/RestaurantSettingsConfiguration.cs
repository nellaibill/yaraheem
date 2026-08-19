using Ecommerce.Modules.Settings.Domain;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Ecommerce.Modules.Settings.Infrastructure.Configurations;

public sealed class RestaurantSettingsConfiguration : IEntityTypeConfiguration<RestaurantSettings>
{
    public void Configure(EntityTypeBuilder<RestaurantSettings> builder)
    {
        builder.ToTable("restaurant_settings");
        builder.HasKey(e => e.Id);

        builder.Property(e => e.TodaysSpecialKey).IsRequired().HasMaxLength(20);
        builder.Property(e => e.BannerTitle).IsRequired().HasMaxLength(100);
        builder.Property(e => e.BannerDescription).IsRequired().HasMaxLength(300);
        builder.Property(e => e.BannerCode).HasMaxLength(30);
        builder.Property(e => e.MinOrderValue).HasPrecision(10, 2);
        builder.Property(e => e.DeliveryRadiusKm).HasPrecision(6, 2);
        builder.Property(e => e.OpenTime).IsRequired().HasMaxLength(5);
        builder.Property(e => e.CloseTime).IsRequired().HasMaxLength(5);
        builder.Property(e => e.UpdatedByEmail).HasMaxLength(256);
    }
}
