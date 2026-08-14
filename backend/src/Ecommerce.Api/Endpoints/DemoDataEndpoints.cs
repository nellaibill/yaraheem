using Ecommerce.Api.Infrastructure;
using Ecommerce.Modules.Catalog.Infrastructure;
using Ecommerce.Modules.Delivery.Infrastructure;
using Ecommerce.Modules.DineIn.Infrastructure;
using Ecommerce.Modules.Identity.Infrastructure;
using Ecommerce.Modules.Inventory.Application;
using Ecommerce.Modules.Orders.Infrastructure;
using Ecommerce.Modules.Payments.Infrastructure;
using Ecommerce.Shared.Kernel;

namespace Ecommerce.Api.Endpoints;

// Spans Orders, Payments, Delivery, DineIn, Identity, Catalog, and Inventory — none of which
// reference each other — so this composition-root endpoint orchestrates the reset, same
// reasoning as PaymentOrderEndpoints/DineInPaymentEndpoints.
public static class DemoDataEndpoints
{
    public static IEndpointRouteBuilder MapDemoDataEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapPost("/api/admin/demo/reset", async (
            OrdersDbContext ordersDb,
            PaymentsDbContext paymentsDb,
            DeliveryDbContext deliveryDb,
            DineInDbContext dineInDb,
            IdentityDbContext identityDb,
            CatalogDbContext catalogDb,
            IInventoryService inventoryService,
            CancellationToken cancellationToken) =>
        {
            await DemoDataSeeder.ResetAsync(ordersDb, paymentsDb, deliveryDb, dineInDb, identityDb, catalogDb, inventoryService, cancellationToken);
            return Results.Ok(ApiResponse<object?>.SuccessResponse(null, "Demo data reset."));
        })
        .WithTags("Demo")
        .RequireAuthorization("AdminOnly")
        .WithSummary("Wipe orders, payments, delivery assignments, and dine-in sessions, then reseed a small curated demo dataset. Destructive — admin only.");

        return app;
    }
}
