using Ecommerce.Modules.Audit.Application;
using Ecommerce.Modules.Settings.Application;
using Ecommerce.Modules.Settings.Contracts;
using Ecommerce.Shared.Infrastructure.Security;
using Ecommerce.Shared.Kernel;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace Ecommerce.Modules.Settings.Endpoints;

public static class RestaurantSettingsEndpoints
{
    public static IEndpointRouteBuilder MapRestaurantSettingsEndpoints(this IEndpointRouteBuilder app)
    {
        // Public and unauthenticated — the storefront (banner, today's special, order-acceptance
        // gate) reads this on every visit, same trust level as the product catalog.
        app.MapGet("/api/settings/restaurant", async (
            IRestaurantSettingsService service,
            CancellationToken cancellationToken) =>
            Results.Ok(ApiResponse<RestaurantSettingsDto>.SuccessResponse(await service.GetAsync(cancellationToken))))
            .WithTags("Settings")
            .WithSummary("Storefront-wide operational settings: order acceptance, offers/banner visibility, today's special, hours.");

        app.MapPut("/api/admin/settings/restaurant", async (
            UpdateRestaurantSettingsRequest request,
            IRestaurantSettingsService service,
            IAuditLogService auditLog,
            ICurrentUser currentUser,
            CancellationToken cancellationToken) =>
        {
            if (string.IsNullOrWhiteSpace(request.TodaysSpecialKey) ||
                string.IsNullOrWhiteSpace(request.BannerTitle) ||
                string.IsNullOrWhiteSpace(request.BannerDescription) ||
                string.IsNullOrWhiteSpace(request.OpenTime) ||
                string.IsNullOrWhiteSpace(request.CloseTime))
            {
                return Results.BadRequest(new ApiResponse<object?>(false, "Today's special, banner title/description, and opening/closing times are required.", null));
            }

            if (request.MinOrderValue < 0 || request.DeliveryRadiusKm < 0)
            {
                return Results.BadRequest(new ApiResponse<object?>(false, "Minimum order value and delivery radius can't be negative.", null));
            }

            var result = await service.UpdateAsync(request, currentUser.UserId, currentUser.Email, cancellationToken);
            await auditLog.LogAsync("RestaurantSettings.Updated", "RestaurantSettings", "singleton", null, cancellationToken);

            return Results.Ok(ApiResponse<RestaurantSettingsDto>.SuccessResponse(result, "Settings saved."));
        })
        .WithTags("Settings")
        .RequireAuthorization("AdminOnly")
        .WithSummary("Update the storefront-wide operational settings. Takes effect immediately for every visitor.");

        return app;
    }
}
