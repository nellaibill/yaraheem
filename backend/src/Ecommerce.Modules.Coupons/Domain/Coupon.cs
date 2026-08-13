using Ecommerce.Shared.Kernel;

namespace Ecommerce.Modules.Coupons.Domain;

public class Coupon : BaseEntity
{
    public required string Code { get; set; }
    public required string Title { get; set; }
    public string? Description { get; set; }
    public decimal DiscountPercent { get; set; }
    public decimal? MaxDiscountAmount { get; set; }
    public decimal MinOrderSubtotal { get; set; }
    public int? UsageLimit { get; set; }
    public int UsageCount { get; set; }
    public int? PerUserLimit { get; set; }
    public DateTimeOffset? ValidUntil { get; set; }
    public bool IsActive { get; set; } = true;
}
