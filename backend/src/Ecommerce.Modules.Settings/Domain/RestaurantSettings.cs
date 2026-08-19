using Ecommerce.Shared.Kernel;

namespace Ecommerce.Modules.Settings.Domain;

/// <summary>
/// Singleton row of storefront-wide operational settings (only one ever exists — see
/// RestaurantSettingsService.GetOrCreateAsync). Read publicly by the storefront (banner,
/// today's special, order-acceptance gate) and written only by Admin.
/// </summary>
public sealed class RestaurantSettings : BaseEntity
{
    public bool AcceptingOrders { get; set; } = true;
    public bool OffersEnabled { get; set; } = true;
    public required string TodaysSpecialKey { get; set; }

    public bool BannerEnabled { get; set; } = true;
    public required string BannerTitle { get; set; }
    public required string BannerDescription { get; set; }
    public string? BannerCode { get; set; }

    public decimal MinOrderValue { get; set; }
    public decimal DeliveryRadiusKm { get; set; }
    public required string OpenTime { get; set; }
    public required string CloseTime { get; set; }

    public Guid? UpdatedByUserId { get; set; }
    public string? UpdatedByEmail { get; set; }
}
