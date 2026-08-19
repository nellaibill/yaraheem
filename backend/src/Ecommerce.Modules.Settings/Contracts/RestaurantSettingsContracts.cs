namespace Ecommerce.Modules.Settings.Contracts;

public sealed record RestaurantSettingsDto(
    bool AcceptingOrders,
    bool OffersEnabled,
    string TodaysSpecialKey,
    bool BannerEnabled,
    string BannerTitle,
    string BannerDescription,
    string? BannerCode,
    decimal MinOrderValue,
    decimal DeliveryRadiusKm,
    string OpenTime,
    string CloseTime);

public sealed record UpdateRestaurantSettingsRequest(
    bool AcceptingOrders,
    bool OffersEnabled,
    string TodaysSpecialKey,
    bool BannerEnabled,
    string BannerTitle,
    string BannerDescription,
    string? BannerCode,
    decimal MinOrderValue,
    decimal DeliveryRadiusKm,
    string OpenTime,
    string CloseTime);
