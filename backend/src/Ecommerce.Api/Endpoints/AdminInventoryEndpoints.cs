using Ecommerce.Modules.Catalog.Infrastructure;
using Ecommerce.Modules.Inventory.Application;
using Ecommerce.Modules.Inventory.Contracts;
using Ecommerce.Modules.Inventory.Options;
using Ecommerce.Shared.Kernel;
using FluentValidation;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace Ecommerce.Api.Endpoints;

// Bridges the Catalog and Inventory modules (product name/SKU enrichment for admin display),
// which do not reference each other in the write direction. Lives in the composition root.
public static class AdminInventoryEndpoints
{
    public static IEndpointRouteBuilder MapAdminInventoryEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/admin/inventory").WithTags("Admin Inventory").RequireAuthorization("AdminOnly");

        group.MapGet("/", async (
            int page,
            int pageSize,
            IInventoryService inventoryService,
            CatalogDbContext catalogDb,
            CancellationToken cancellationToken) =>
        {
            var result = await inventoryService.GetAllAsync(page <= 0 ? 1 : page, pageSize <= 0 ? 20 : pageSize, cancellationToken);
            var enriched = await EnrichAsync(result.Items, catalogDb, cancellationToken);

            return Results.Ok(ApiResponse<PagedResult<AdminInventoryItemResponse>>.SuccessResponse(new PagedResult<AdminInventoryItemResponse>
            {
                Items = enriched,
                Page = result.Page,
                PageSize = result.PageSize,
                TotalCount = result.TotalCount,
            }));
        });

        group.MapGet("/low-stock", async (
            IOptions<InventoryOptions> options,
            IInventoryService inventoryService,
            CatalogDbContext catalogDb,
            CancellationToken cancellationToken) =>
        {
            var items = await inventoryService.GetLowStockAsync(options.Value.LowStockThreshold, cancellationToken);
            var enriched = await EnrichAsync(items, catalogDb, cancellationToken);
            return Results.Ok(ApiResponse<IReadOnlyList<AdminInventoryItemResponse>>.SuccessResponse(enriched));
        }).WithSummary("Products where stock on hand is at or below the configured low-stock threshold.");

        group.MapPut("/{productId:guid}/stock", async (
            Guid productId,
            SetStockRequest request,
            IValidator<SetStockRequest> validator,
            IInventoryService inventoryService,
            CancellationToken cancellationToken) =>
        {
            await validator.ValidateAndThrowAsync(request, cancellationToken);
            var result = await inventoryService.SetStockAsync(productId, request.Quantity, cancellationToken);
            return Results.Ok(ApiResponse<InventoryItemDto>.SuccessResponse(result, "Stock updated."));
        });

        group.MapPost("/adjustments", async (
            CreateInventoryAdjustmentRequest request,
            IValidator<CreateInventoryAdjustmentRequest> validator,
            IInventoryService inventoryService,
            CancellationToken cancellationToken) =>
        {
            await validator.ValidateAndThrowAsync(request, cancellationToken);
            var result = await inventoryService.CreateAdjustmentAsync(request, cancellationToken);
            return Results.Ok(ApiResponse<InventoryItemDto>.SuccessResponse(result, "Inventory adjusted."));
        }).WithDescription("Example: { \"productId\": \"uuid\", \"quantity\": 10, \"reason\": \"ManualCorrection\", \"notes\": \"Stock count corrected after audit\" }");

        return app;
    }

    private static async Task<List<AdminInventoryItemResponse>> EnrichAsync(
        IReadOnlyList<InventoryItemDto> items, CatalogDbContext catalogDb, CancellationToken cancellationToken)
    {
        var productIds = items.Select(i => i.ProductId).ToList();
        var products = await catalogDb.Products.AsNoTracking()
            .Where(p => productIds.Contains(p.Id))
            .Select(p => new { p.Id, p.Name, p.Sku })
            .ToListAsync(cancellationToken);

        var byId = products.ToDictionary(p => p.Id);

        return items.Select(i =>
        {
            byId.TryGetValue(i.ProductId, out var product);
            return new AdminInventoryItemResponse(
                i.ProductId, product?.Name ?? "Unknown product", product?.Sku ?? "",
                i.QuantityOnHand, i.QuantityReserved, i.QuantityAvailable);
        }).ToList();
    }
}

public sealed record AdminInventoryItemResponse(Guid ProductId, string ProductName, string Sku, int QuantityOnHand, int QuantityReserved, int QuantityAvailable);
