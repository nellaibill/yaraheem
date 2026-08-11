using Ecommerce.Modules.Cart.Application;
using Ecommerce.Modules.Cart.Contracts;
using Ecommerce.Shared.Kernel;
using FluentValidation;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace Ecommerce.Modules.Cart.Endpoints;

public static class CartEndpoints
{
    public static IEndpointRouteBuilder MapCartEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/cart").WithTags("Cart").RequireAuthorization();

        group.MapGet("/", async (ICurrentUser currentUser, ICartService service, CancellationToken cancellationToken) =>
            Results.Ok(ApiResponse<CartDto>.SuccessResponse(await service.GetCurrentCartAsync(currentUser.UserId!.Value, cancellationToken))));

        group.MapPost("/items", async (
            AddCartItemRequest request,
            IValidator<AddCartItemRequest> validator,
            ICurrentUser currentUser,
            ICartService service,
            CancellationToken cancellationToken) =>
        {
            await validator.ValidateAndThrowAsync(request, cancellationToken);
            var result = await service.AddItemAsync(currentUser.UserId!.Value, request, cancellationToken);
            return Results.Ok(ApiResponse<CartDto>.SuccessResponse(result, "Item added to cart."));
        });

        group.MapPut("/items/{itemId:guid}", async (
            Guid itemId,
            UpdateCartItemRequest request,
            IValidator<UpdateCartItemRequest> validator,
            ICurrentUser currentUser,
            ICartService service,
            CancellationToken cancellationToken) =>
        {
            await validator.ValidateAndThrowAsync(request, cancellationToken);
            var result = await service.UpdateItemQuantityAsync(currentUser.UserId!.Value, itemId, request, cancellationToken);
            return Results.Ok(ApiResponse<CartDto>.SuccessResponse(result, "Cart item updated."));
        });

        group.MapDelete("/items/{itemId:guid}", async (
            Guid itemId,
            ICurrentUser currentUser,
            ICartService service,
            CancellationToken cancellationToken) =>
        {
            var result = await service.RemoveItemAsync(currentUser.UserId!.Value, itemId, cancellationToken);
            return Results.Ok(ApiResponse<CartDto>.SuccessResponse(result, "Item removed from cart."));
        });

        group.MapDelete("/clear", async (ICurrentUser currentUser, ICartService service, CancellationToken cancellationToken) =>
        {
            await service.ClearCartAsync(currentUser.UserId!.Value, cancellationToken);
            var result = await service.GetCurrentCartAsync(currentUser.UserId!.Value, cancellationToken);
            return Results.Ok(ApiResponse<CartDto>.SuccessResponse(result, "Cart cleared."));
        });

        return app;
    }
}
