using Ecommerce.Modules.Settings.Contracts;
using Ecommerce.Modules.Settings.Infrastructure;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Modules.Settings.Application;

/// <summary>
/// Backs the storefront's operational settings (order-acceptance gate, offers/banner visibility,
/// today's special, min order/delivery radius display, hours). Only one row ever exists —
/// GetAsync falls back to hardcoded defaults if the table is still empty; UpdateAsync creates the
/// row on first save.
/// </summary>
public sealed class RestaurantSettingsService(SettingsDbContext db) : IRestaurantSettingsService
{
    public async Task<RestaurantSettingsDto> GetAsync(CancellationToken cancellationToken)
    {
        var entity = await db.RestaurantSettings.AsNoTracking().FirstOrDefaultAsync(cancellationToken);
        return entity is null ? Defaults() : ToDto(entity);
    }

    public async Task<RestaurantSettingsDto> UpdateAsync(UpdateRestaurantSettingsRequest request, Guid? updatedByUserId, string? updatedByEmail, CancellationToken cancellationToken)
    {
        var entity = await db.RestaurantSettings.FirstOrDefaultAsync(cancellationToken);
        if (entity is null)
        {
            entity = new Domain.RestaurantSettings
            {
                TodaysSpecialKey = request.TodaysSpecialKey,
                BannerTitle = request.BannerTitle,
                BannerDescription = request.BannerDescription,
                OpenTime = request.OpenTime,
                CloseTime = request.CloseTime,
            };
            db.RestaurantSettings.Add(entity);
        }

        entity.AcceptingOrders = request.AcceptingOrders;
        entity.OffersEnabled = request.OffersEnabled;
        entity.TodaysSpecialKey = request.TodaysSpecialKey;
        entity.BannerEnabled = request.BannerEnabled;
        entity.BannerTitle = request.BannerTitle;
        entity.BannerDescription = request.BannerDescription;
        entity.BannerCode = string.IsNullOrWhiteSpace(request.BannerCode) ? null : request.BannerCode.Trim();
        entity.MinOrderValue = request.MinOrderValue;
        entity.DeliveryRadiusKm = request.DeliveryRadiusKm;
        entity.OpenTime = request.OpenTime;
        entity.CloseTime = request.CloseTime;
        entity.UpdatedByUserId = updatedByUserId;
        entity.UpdatedByEmail = updatedByEmail;

        await db.SaveChangesAsync(cancellationToken);
        return ToDto(entity);
    }

    // Mirrors the frontend's DEFAULT_RESTAURANT_SETTINGS/DEFAULT_PROMO_BANNER constants — used
    // only until the first admin save ever creates the row.
    private static RestaurantSettingsDto Defaults() => new(
        AcceptingOrders: true,
        OffersEnabled: true,
        TodaysSpecialKey: "daily",
        BannerEnabled: true,
        BannerTitle: "Weekend Treat",
        BannerDescription: "15% off every Saturday and Sunday. Use code WEEKEND15 at checkout.",
        BannerCode: "WEEKEND15",
        MinOrderValue: 199m,
        DeliveryRadiusKm: 12m,
        OpenTime: "11:00",
        CloseTime: "23:00");

    private static RestaurantSettingsDto ToDto(Domain.RestaurantSettings e) => new(
        e.AcceptingOrders, e.OffersEnabled, e.TodaysSpecialKey, e.BannerEnabled, e.BannerTitle,
        e.BannerDescription, e.BannerCode, e.MinOrderValue, e.DeliveryRadiusKm, e.OpenTime, e.CloseTime);
}
