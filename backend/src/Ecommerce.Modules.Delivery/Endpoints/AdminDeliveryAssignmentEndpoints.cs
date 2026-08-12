using Ecommerce.Modules.Delivery.Application;
using Ecommerce.Modules.Delivery.Contracts;
using Ecommerce.Shared.Kernel;
using FluentValidation;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace Ecommerce.Modules.Delivery.Endpoints;

public static class AdminDeliveryAssignmentEndpoints
{
    public static IEndpointRouteBuilder MapAdminDeliveryAssignmentEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/admin/orders").WithTags("Admin").RequireAuthorization("AdminOnly");

        group.MapGet("/{id:guid}/delivery-assignment", async (Guid id, IDeliveryService service, CancellationToken cancellationToken) =>
            Results.Ok(ApiResponse<OrderAssignmentDto?>.SuccessResponse(await service.GetAssignmentAsync(id, cancellationToken))))
            .WithSummary("Get the current delivery-partner assignment for an order, if any.");

        group.MapPut("/{id:guid}/assign-delivery", async (
            Guid id,
            AssignDeliveryRequest request,
            IValidator<AssignDeliveryRequest> validator,
            IDeliveryService service,
            CancellationToken cancellationToken) =>
        {
            await validator.ValidateAndThrowAsync(request, cancellationToken);
            var result = await service.AssignOrderAsync(id, request.DeliveryPartnerId, cancellationToken);
            return Results.Ok(ApiResponse<OrderAssignmentDto>.SuccessResponse(result, "Order assigned to delivery partner."));
        }).WithSummary("Assign (or reassign) an order to a delivery partner.");

        return app;
    }
}
