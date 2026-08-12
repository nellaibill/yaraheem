using Ecommerce.Modules.Delivery.Application;
using Ecommerce.Modules.Delivery.Contracts;
using Ecommerce.Shared.Kernel;
using FluentValidation;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace Ecommerce.Modules.Delivery.Endpoints;

public static class DeliveryEndpoints
{
    public static IEndpointRouteBuilder MapDeliveryEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/delivery").WithTags("Delivery").RequireAuthorization("DeliveryOnly");

        group.MapGet("/my-orders", async (ICurrentUser currentUser, IDeliveryService service, CancellationToken cancellationToken) =>
        {
            var result = await service.GetMyOrdersAsync(currentUser.UserId!.Value, cancellationToken);
            return Results.Ok(ApiResponse<IReadOnlyList<MyDeliveryOrderDto>>.SuccessResponse(result));
        }).WithSummary("List orders assigned to the authenticated delivery partner.");

        group.MapPut("/orders/{id:guid}/status", async (
            Guid id,
            UpdateDeliveryStatusRequest request,
            IValidator<UpdateDeliveryStatusRequest> validator,
            ICurrentUser currentUser,
            IDeliveryService service,
            CancellationToken cancellationToken) =>
        {
            await validator.ValidateAndThrowAsync(request, cancellationToken);
            var result = await service.UpdateAssignmentStatusAsync(id, currentUser.UserId!.Value, request.Status, cancellationToken);
            return Results.Ok(ApiResponse<MyDeliveryOrderDto>.SuccessResponse(result, "Delivery status updated."));
        }).WithSummary("Advance the authenticated delivery partner's own assignment status. Assigned→PickedUp→OutForDelivery→Delivered only.");

        return app;
    }
}
