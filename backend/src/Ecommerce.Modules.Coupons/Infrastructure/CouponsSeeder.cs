using Ecommerce.Modules.Coupons.Domain;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Modules.Coupons.Infrastructure;

public static class CouponsSeeder
{
    public static async Task SeedAsync(CouponsDbContext db, CancellationToken cancellationToken = default)
    {
        if (await db.Coupons.AnyAsync(cancellationToken))
        {
            return;
        }

        db.Coupons.AddRange(
            new Coupon
            {
                Code = "WELCOME50",
                Title = "Welcome Offer",
                Description = "Flat 50% off on your first order.",
                DiscountPercent = 50,
                MaxDiscountAmount = 150,
                MinOrderSubtotal = 299,
                PerUserLimit = 1,
            },
            new Coupon
            {
                Code = "BIRYANI20",
                Title = "Biryani Special",
                Description = "20% off on all biryani orders above Rs. 500.",
                DiscountPercent = 20,
                MaxDiscountAmount = 200,
                MinOrderSubtotal = 500,
            },
            new Coupon
            {
                Code = "FAMILY100",
                Title = "Family Feast",
                Description = "Flat discount on orders above Rs. 999 — perfect for family orders.",
                DiscountPercent = 10,
                MaxDiscountAmount = 100,
                MinOrderSubtotal = 999,
            },
            new Coupon
            {
                Code = "WEEKEND15",
                Title = "Weekend Treat",
                Description = "15% off every Saturday and Sunday.",
                DiscountPercent = 15,
                MaxDiscountAmount = 120,
                MinOrderSubtotal = 349,
            });

        await db.SaveChangesAsync(cancellationToken);
    }
}
