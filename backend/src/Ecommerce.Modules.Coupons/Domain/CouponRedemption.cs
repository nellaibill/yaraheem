using Ecommerce.Shared.Kernel;

namespace Ecommerce.Modules.Coupons.Domain;

public class CouponRedemption : BaseEntity
{
    public Guid CouponId { get; set; }
    public Guid UserId { get; set; }
    public Guid OrderId { get; set; }
    public decimal DiscountAmount { get; set; }
}
