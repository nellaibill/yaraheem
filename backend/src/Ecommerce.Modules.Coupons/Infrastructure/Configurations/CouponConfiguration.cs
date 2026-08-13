using Ecommerce.Modules.Coupons.Domain;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Ecommerce.Modules.Coupons.Infrastructure.Configurations;

public sealed class CouponConfiguration : IEntityTypeConfiguration<Coupon>
{
    public void Configure(EntityTypeBuilder<Coupon> builder)
    {
        builder.ToTable("coupons");
        builder.HasKey(c => c.Id);

        builder.Property(c => c.Code).IsRequired().HasMaxLength(30);
        builder.HasIndex(c => c.Code).IsUnique();

        builder.Property(c => c.Title).IsRequired().HasMaxLength(200);
        builder.Property(c => c.Description).HasMaxLength(500);
        builder.Property(c => c.DiscountPercent).HasColumnType("numeric(5,2)");
        builder.Property(c => c.MaxDiscountAmount).HasColumnType("numeric(12,2)");
        builder.Property(c => c.MinOrderSubtotal).HasColumnType("numeric(12,2)");
    }
}
