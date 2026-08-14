using Ecommerce.Modules.DineIn.Application;
using Ecommerce.Modules.DineIn.Contracts;
using Ecommerce.Shared.Kernel;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace Ecommerce.Modules.DineIn.Endpoints;

/// <summary>
/// Kitchen-facing endpoints: the queue of rounds waiting to be prepared, and advancing a round
/// through Fired -> Preparing -> Ready -> Served. Deliberately not nested under the
/// /api/staff/dinein group (which requires the DineInStaff policy) since a Kitchen-only account
/// has neither the Waiter nor Admin role — it needs its own, narrower policy.
/// </summary>
public static class DineInKitchenEndpoints
{
    public static IEndpointRouteBuilder MapDineInKitchenEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/staff/dinein/kitchen").WithTags("DineIn").RequireAuthorization("DineInKitchen");

        group.MapGet("/rounds", async (ITableSessionService service, CancellationToken cancellationToken) =>
            Results.Ok(ApiResponse<List<KitchenRoundDto>>.SuccessResponse(await service.GetKitchenQueueAsync(cancellationToken))))
            .WithSummary("Every round still waiting on the kitchen, across all tables, oldest first.");

        group.MapPost("/rounds/{roundId:guid}/advance", async (
            Guid roundId,
            ITableSessionService service,
            CancellationToken cancellationToken) =>
            Results.Ok(ApiResponse<KitchenRoundDto>.SuccessResponse(await service.AdvanceRoundStatusAsync(roundId, cancellationToken), "Round status updated.")))
            .WithSummary("Move a round to its next status: Fired -> Preparing -> Ready -> Served.");

        return app;
    }
}
