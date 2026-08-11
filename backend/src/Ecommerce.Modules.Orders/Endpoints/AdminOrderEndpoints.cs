using Ecommerce.Modules.Orders.Application;
using Ecommerce.Modules.Orders.Contracts;
using Ecommerce.Shared.Kernel;
using FluentValidation;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace Ecommerce.Modules.Orders.Endpoints;

public static class AdminOrderEndpoints
{
    public static IEndpointRouteBuilder MapAdminOrderEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/admin/orders").WithTags("Admin").RequireAuthorization("AdminOnly");

        group.MapGet("/", async (
            [AsParameters] AdminOrderQuery query,
            IValidator<AdminOrderQuery> validator,
            IOrderService service,
            CancellationToken cancellationToken) =>
        {
            await validator.ValidateAndThrowAsync(query, cancellationToken);
            var result = await service.GetAdminOrdersAsync(query, cancellationToken);
            return Results.Ok(ApiResponse<PagedResult<OrderDto>>.SuccessResponse(result));
        }).WithSummary("List all orders. Filter by status, orderNumber, customerEmail, fromDate, toDate.");

        group.MapGet("/{id:guid}", async (Guid id, IOrderService service, CancellationToken cancellationToken) =>
        {
            var result = await service.GetByIdAsync(Guid.Empty, isAdmin: true, id, cancellationToken);
            return Results.Ok(ApiResponse<OrderDto>.SuccessResponse(result));
        });

        group.MapPut("/{id:guid}/status", async (
            Guid id,
            UpdateOrderStatusRequest request,
            IValidator<UpdateOrderStatusRequest> validator,
            ICurrentUser currentUser,
            IOrderService service,
            CancellationToken cancellationToken) =>
        {
            await validator.ValidateAndThrowAsync(request, cancellationToken);
            var result = await service.UpdateStatusAsync(id, request, currentUser.UserId, cancellationToken);
            return Results.Ok(ApiResponse<OrderDto>.SuccessResponse(result, "Order status updated."));
        }).WithSummary("Transition an order's status. Only Pending→Confirmed→Processing→Shipped→Delivered and cancellation from Pending/Confirmed/Processing are allowed.")
          .WithDescription("Example: { \"status\": \"Processing\", \"notes\": \"Packed and ready for shipment\" }");

        return app;
    }
}
