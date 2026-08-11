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

        group.MapPost("/", async (
            CreateOrderRequest request,
            IValidator<CreateOrderRequest> validator,
            ICurrentUser currentUser,
            IOrderService service,
            CancellationToken cancellationToken) =>
        {
            await validator.ValidateAndThrowAsync(request, cancellationToken);
            var result = await service.CreateFromCartAsync(currentUser.UserId!.Value, request, cancellationToken);
            return Results.Created($"/api/orders/{result.Id}", result);
        });

        group.MapGet("/mine", async (
            int page,
            int pageSize,
            ICurrentUser currentUser,
            IOrderService service,
            CancellationToken cancellationToken) =>
            Results.Ok(await service.GetMyOrdersAsync(currentUser.UserId!.Value, page <= 0 ? 1 : page, pageSize <= 0 ? 20 : pageSize, cancellationToken)));

        group.MapGet("/{id:guid}", async (
            Guid id,
            ICurrentUser currentUser,
            IOrderService service,
            CancellationToken cancellationToken) =>
            Results.Ok(await service.GetByIdAsync(currentUser.UserId!.Value, currentUser.IsInRole("Admin"), id, cancellationToken)));

        group.MapPut("/{id:guid}/status", async (
            Guid id,
            UpdateOrderStatusRequest request,
            IValidator<UpdateOrderStatusRequest> validator,
            IOrderService service,
            CancellationToken cancellationToken) =>
        {
            await validator.ValidateAndThrowAsync(request, cancellationToken);
            return Results.Ok(await service.UpdateStatusAsync(id, request, cancellationToken));
        }).RequireAuthorization("AdminOnly");

        return app;
    }
}
