using Ecommerce.Modules.Coupons.Domain;
using Ecommerce.Shared.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Modules.Coupons.Infrastructure;

public class CouponsDbContext(DbContextOptions<CouponsDbContext> options) : AuditableDbContext(options)
{
    public const string Schema = "coupons";

    public DbSet<Coupon> Coupons => Set<Coupon>();
    public DbSet<CouponRedemption> CouponRedemptions => Set<CouponRedemption>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasDefaultSchema(Schema);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(CouponsDbContext).Assembly);
        modelBuilder.ApplySnakeCaseNames();
        base.OnModelCreating(modelBuilder);
    }
}
