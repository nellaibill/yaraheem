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
            Results.Ok(await service.GetCurrentCartAsync(currentUser.UserId!.Value, cancellationToken)));

        group.MapPost("/items", async (
            AddCartItemRequest request,
            IValidator<AddCartItemRequest> validator,
            ICurrentUser currentUser,
            ICartService service,
            CancellationToken cancellationToken) =>
        {
            await validator.ValidateAndThrowAsync(request, cancellationToken);
            return Results.Ok(await service.AddItemAsync(currentUser.UserId!.Value, request, cancellationToken));
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
            return Results.Ok(await service.UpdateItemQuantityAsync(currentUser.UserId!.Value, itemId, request, cancellationToken));
        });

        group.MapDelete("/items/{itemId:guid}", async (
            Guid itemId,
            ICurrentUser currentUser,
            ICartService service,
            CancellationToken cancellationToken) =>
            Results.Ok(await service.RemoveItemAsync(currentUser.UserId!.Value, itemId, cancellationToken)));

        return app;
    }
}
