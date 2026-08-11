using Ecommerce.Modules.Inventory.Application;
using Ecommerce.Modules.Inventory.Contracts;
using Ecommerce.Shared.Kernel;
using FluentValidation;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace Ecommerce.Modules.Inventory.Endpoints;

public static class InventoryEndpoints
{
    public static IEndpointRouteBuilder MapInventoryEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/inventory").WithTags("Inventory").RequireAuthorization("AdminOnly");

        group.MapPost("/adjust", async (
            AdjustInventoryRequest request,
            IValidator<AdjustInventoryRequest> validator,
            IInventoryService service,
            CancellationToken cancellationToken) =>
        {
            await validator.ValidateAndThrowAsync(request, cancellationToken);
            var result = await service.AdjustAsync(request, cancellationToken);
            return Results.Ok(ApiResponse<InventoryItemDto>.SuccessResponse(result, "Inventory adjusted."));
        }).WithSummary("Adjust stock for a product (purchase, sale correction, or manual adjustment).");

        return app;
    }
}
