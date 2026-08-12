using Ecommerce.Modules.Catalog.Application;
using Ecommerce.Modules.Catalog.Contracts;
using Ecommerce.Shared.Kernel;
using FluentValidation;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace Ecommerce.Modules.Catalog.Endpoints;

public static class AdminProductVariantEndpoints
{
    public static IEndpointRouteBuilder MapAdminProductVariantEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/admin/products/{id:guid}/variants").WithTags("Admin Products").RequireAuthorization("AdminOnly");

        group.MapGet("/", async (Guid id, IProductVariantService service, CancellationToken cancellationToken) =>
            Results.Ok(ApiResponse<IReadOnlyList<ProductVariantDto>>.SuccessResponse(await service.GetVariantsAsync(id, cancellationToken))));

        group.MapPost("/", async (
            Guid id,
            CreateProductVariantRequest request,
            IValidator<CreateProductVariantRequest> validator,
            IProductVariantService service,
            CancellationToken cancellationToken) =>
        {
            await validator.ValidateAndThrowAsync(request, cancellationToken);
            var result = await service.CreateVariantAsync(id, request, cancellationToken);
            return Results.Ok(ApiResponse<ProductVariantDto>.SuccessResponse(result, "Variant created."));
        }).WithDescription("Example: { \"sku\": \"BIR-001-L\", \"size\": \"Large\", \"color\": null, \"priceOverride\": 350, \"stockQuantity\": 20, \"isActive\": true }");

        group.MapPut("/{variantId:guid}", async (
            Guid id,
            Guid variantId,
            UpdateProductVariantRequest request,
            IValidator<UpdateProductVariantRequest> validator,
            IProductVariantService service,
            CancellationToken cancellationToken) =>
        {
            await validator.ValidateAndThrowAsync(request, cancellationToken);
            var result = await service.UpdateVariantAsync(id, variantId, request, cancellationToken);
            return Results.Ok(ApiResponse<ProductVariantDto>.SuccessResponse(result, "Variant updated."));
        });

        group.MapDelete("/{variantId:guid}", async (Guid id, Guid variantId, IProductVariantService service, CancellationToken cancellationToken) =>
        {
            await service.DeleteVariantAsync(id, variantId, cancellationToken);
            return Results.Ok(ApiResponse<object?>.SuccessResponse(null, "Variant deleted."));
        });

        return app;
    }
}
