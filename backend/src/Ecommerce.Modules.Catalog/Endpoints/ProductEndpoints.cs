using Ecommerce.Modules.Catalog.Application;
using Ecommerce.Modules.Catalog.Contracts;
using Ecommerce.Shared.Kernel;
using FluentValidation;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace Ecommerce.Modules.Catalog.Endpoints;

public static class ProductEndpoints
{
    public static IEndpointRouteBuilder MapProductEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/products").WithTags("Catalog");

        group.MapGet("/", async (
            [AsParameters] ProductQuery query,
            IValidator<ProductQuery> validator,
            IProductService service,
            CancellationToken cancellationToken) =>
        {
            await validator.ValidateAndThrowAsync(query, cancellationToken);
            var result = await service.SearchAsync(query, cancellationToken);
            return Results.Ok(ApiResponse<PagedResult<ProductListResponse>>.SuccessResponse(result));
        }).WithSummary("List products (paged, searchable, sortable, filterable by category).");

        group.MapGet("/featured", async (int? take, IProductService service, CancellationToken cancellationToken) =>
        {
            var result = await service.GetFeaturedAsync(take is > 0 ? take.Value : 8, cancellationToken);
            return Results.Ok(ApiResponse<IReadOnlyList<ProductListResponse>>.SuccessResponse(result));
        }).WithSummary("List featured, published products.");

        group.MapGet("/slug/{slug}", async (string slug, IProductService service, CancellationToken cancellationToken) =>
        {
            var result = await service.GetBySlugAsync(slug, cancellationToken);
            return Results.Ok(ApiResponse<ProductDetailsResponse>.SuccessResponse(result));
        });

        group.MapGet("/{id:guid}", async (Guid id, IProductService service, CancellationToken cancellationToken) =>
        {
            var result = await service.GetByIdAsync(id, cancellationToken);
            return Results.Ok(ApiResponse<ProductDetailsResponse>.SuccessResponse(result));
        });

        group.MapPost("/", async (
            CreateProductRequest request,
            IValidator<CreateProductRequest> validator,
            IProductService service,
            CancellationToken cancellationToken) =>
        {
            await validator.ValidateAndThrowAsync(request, cancellationToken);
            var result = await service.CreateAsync(request, cancellationToken);
            return Results.Created($"/api/products/{result.Id}", ApiResponse<ProductDetailsResponse>.SuccessResponse(result, "Product created."));
        }).RequireAuthorization("AdminOnly");

        group.MapPut("/{id:guid}", async (
            Guid id,
            UpdateProductRequest request,
            IValidator<UpdateProductRequest> validator,
            IProductService service,
            CancellationToken cancellationToken) =>
        {
            await validator.ValidateAndThrowAsync(request, cancellationToken);
            var result = await service.UpdateAsync(id, request, cancellationToken);
            return Results.Ok(ApiResponse<ProductDetailsResponse>.SuccessResponse(result, "Product updated."));
        }).RequireAuthorization("AdminOnly");

        group.MapDelete("/{id:guid}", async (Guid id, IProductService service, CancellationToken cancellationToken) =>
        {
            await service.DeleteAsync(id, cancellationToken);
            return Results.Ok(ApiResponse<object?>.SuccessResponse(null, "Product deleted."));
        }).RequireAuthorization("AdminOnly");

        return app;
    }
}
