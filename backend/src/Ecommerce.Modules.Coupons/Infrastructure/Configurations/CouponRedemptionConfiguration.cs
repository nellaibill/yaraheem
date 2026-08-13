using Ecommerce.Modules.Coupons.Domain;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Ecommerce.Modules.Coupons.Infrastructure.Configurations;

public sealed class CouponRedemptionConfiguration : IEntityTypeConfiguration<CouponRedemption>
{
    public void Configure(EntityTypeBuilder<CouponRedemption> builder)
    {
        builder.ToTable("coupon_redemptions");
        builder.HasKey(r => r.Id);

        builder.Property(r => r.DiscountAmount).HasColumnType("numeric(12,2)");

        builder.HasIndex(r => r.CouponId);
        builder.HasIndex(r => r.UserId);
        builder.HasIndex(r => r.OrderId).IsUnique();
    }
}
