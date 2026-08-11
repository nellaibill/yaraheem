using Ecommerce.Modules.Orders.Application;
using Ecommerce.Modules.Orders.Contracts;
using Ecommerce.Shared.Kernel;
using FluentValidation;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace Ecommerce.Modules.Orders.Endpoints;

public static class OrderEndpoints
{
    public static IEndpointRouteBuilder MapOrderEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/orders").WithTags("Orders").RequireAuthorization();

        group.MapPost("/checkout", async (
            CheckoutRequest request,
            IValidator<CheckoutRequest> validator,
            ICurrentUser currentUser,
            IOrderService service,
            CancellationToken cancellationToken) =>
        {
            await validator.ValidateAndThrowAsync(request, cancellationToken);
            var result = await service.CheckoutAsync(currentUser.UserId!.Value, request, cancellationToken);
            return Results.Created($"/api/orders/{result.Id}", ApiResponse<OrderDto>.SuccessResponse(result, "Order placed."));
        }).WithSummary("Create an order from the current cart, deduct stock, and clear the cart.");

        group.MapGet("/my-orders", async (
            int page,
            int pageSize,
            ICurrentUser currentUser,
            IOrderService service,
            CancellationToken cancellationToken) =>
        {
            var result = await service.GetMyOrdersAsync(currentUser.UserId!.Value, page <= 0 ? 1 : page, pageSize <= 0 ? 20 : pageSize, cancellationToken);
            return Results.Ok(ApiResponse<PagedResult<OrderDto>>.SuccessResponse(result));
        });

        group.MapGet("/{id:guid}", async (
            Guid id,
            ICurrentUser currentUser,
            IOrderService service,
            CancellationToken cancellationToken) =>
        {
            var result = await service.GetByIdAsync(currentUser.UserId!.Value, currentUser.IsInRole("Admin"), id, cancellationToken);
            return Results.Ok(ApiResponse<OrderDto>.SuccessResponse(result));
        });

        group.MapPut("/{id:guid}/status", async (
            Guid id,
            UpdateOrderStatusRequest request,
            IValidator<UpdateOrderStatusRequest> validator,
            IOrderService service,
            CancellationToken cancellationToken) =>
        {
            await validator.ValidateAndThrowAsync(request, cancellationToken);
            var result = await service.UpdateStatusAsync(id, request, cancellationToken);
            return Results.Ok(ApiResponse<OrderDto>.SuccessResponse(result, "Order status updated."));
        }).RequireAuthorization("AdminOnly");

        return app;
    }
}
