using Ecommerce.Modules.Catalog.Application;
using Ecommerce.Modules.Catalog.Contracts;
using FluentValidation;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace Ecommerce.Modules.Catalog.Endpoints;

public static class ProductEndpoints
{
    public static IEndpointRouteBuilder MapProductEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/products").WithTags("Products");

        group.MapGet("/", async (
            [AsParameters] ProductQuery query,
            IValidator<ProductQuery> validator,
            IProductService service,
            CancellationToken cancellationToken) =>
        {
            await validator.ValidateAndThrowAsync(query, cancellationToken);
            return Results.Ok(await service.SearchAsync(query, cancellationToken));
        });

        group.MapGet("/{id:guid}", async (Guid id, IProductService service, CancellationToken cancellationToken) =>
            Results.Ok(await service.GetByIdAsync(id, cancellationToken)));

        group.MapPost("/", async (
            CreateProductRequest request,
            IValidator<CreateProductRequest> validator,
            IProductService service,
            CancellationToken cancellationToken) =>
        {
            await validator.ValidateAndThrowAsync(request, cancellationToken);
            var result = await service.CreateAsync(request, cancellationToken);
            return Results.Created($"/api/products/{result.Id}", result);
        }).RequireAuthorization("AdminOnly");

        group.MapPut("/{id:guid}", async (
            Guid id,
            UpdateProductRequest request,
            IValidator<UpdateProductRequest> validator,
            IProductService service,
            CancellationToken cancellationToken) =>
        {
            await validator.ValidateAndThrowAsync(request, cancellationToken);
            return Results.Ok(await service.UpdateAsync(id, request, cancellationToken));
        }).RequireAuthorization("AdminOnly");

        group.MapDelete("/{id:guid}", async (Guid id, IProductService service, CancellationToken cancellationToken) =>
        {
            await service.DeleteAsync(id, cancellationToken);
            return Results.NoContent();
        }).RequireAuthorization("AdminOnly");

        return app;
    }
}
