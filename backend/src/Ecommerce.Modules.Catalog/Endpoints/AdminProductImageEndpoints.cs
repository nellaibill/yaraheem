using Ecommerce.Modules.Catalog.Application;
using Ecommerce.Modules.Catalog.Contracts;
using Ecommerce.Shared.Kernel;
using FluentValidation;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace Ecommerce.Modules.Catalog.Endpoints;

public static class AdminProductImageEndpoints
{
    public static IEndpointRouteBuilder MapAdminProductImageEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/admin/products/{id:guid}/images").WithTags("Admin Products").RequireAuthorization("AdminOnly");

        group.MapGet("/", async (Guid id, IProductImageService service, CancellationToken cancellationToken) =>
            Results.Ok(ApiResponse<IReadOnlyList<ProductImageDto>>.SuccessResponse(await service.GetImagesAsync(id, cancellationToken))));

        group.MapPost("/", async (
            Guid id,
            CreateProductImageRequest request,
            IValidator<CreateProductImageRequest> validator,
            IProductImageService service,
            CancellationToken cancellationToken) =>
        {
            await validator.ValidateAndThrowAsync(request, cancellationToken);
            var result = await service.AddImageAsync(id, request, cancellationToken);
            return Results.Ok(ApiResponse<ProductImageDto>.SuccessResponse(result, "Image added."));
        }).WithDescription("Example: { \"url\": \"https://upload.wikimedia.org/.../dish.jpg\", \"altText\": \"Dish front view\", \"displayOrder\": 0, \"isPrimary\": true }");

        group.MapDelete("/{imageId:guid}", async (Guid id, Guid imageId, IProductImageService service, CancellationToken cancellationToken) =>
        {
            await service.DeleteImageAsync(id, imageId, cancellationToken);
            return Results.Ok(ApiResponse<object?>.SuccessResponse(null, "Image deleted."));
        });

        group.MapPut("/reorder", async (
            Guid id,
            ReorderProductImagesRequest request,
            IValidator<ReorderProductImagesRequest> validator,
            IProductImageService service,
            CancellationToken cancellationToken) =>
        {
            await validator.ValidateAndThrowAsync(request, cancellationToken);
            var result = await service.ReorderImagesAsync(id, request, cancellationToken);
            return Results.Ok(ApiResponse<IReadOnlyList<ProductImageDto>>.SuccessResponse(result, "Images reordered."));
        });

        group.MapPut("/{imageId:guid}/primary", async (Guid id, Guid imageId, IProductImageService service, CancellationToken cancellationToken) =>
        {
            var result = await service.SetPrimaryImageAsync(id, imageId, cancellationToken);
            return Results.Ok(ApiResponse<ProductImageDto>.SuccessResponse(result, "Primary image updated."));
        });

        return app;
    }
}
