using Ecommerce.Modules.Catalog.Contracts;
using Ecommerce.Modules.Catalog.Domain;
using Ecommerce.Modules.Catalog.Infrastructure;
using Ecommerce.Shared.Kernel.Exceptions;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Modules.Catalog.Application;

public sealed class ProductVariantService(CatalogDbContext db) : IProductVariantService
{
    public async Task<IReadOnlyList<ProductVariantDto>> GetVariantsAsync(Guid productId, CancellationToken cancellationToken)
    {
        await EnsureProductExistsAsync(productId, cancellationToken);

        var variants = await db.ProductVariants.AsNoTracking()
            .Where(v => v.ProductId == productId)
            .OrderBy(v => v.Sku)
            .ToListAsync(cancellationToken);

        return variants.Select(ToDto).ToList();
    }

    public async Task<ProductVariantDto> CreateVariantAsync(Guid productId, CreateProductVariantRequest request, CancellationToken cancellationToken)
    {
        await EnsureProductExistsAsync(productId, cancellationToken);
        await EnsureSkuIsUniqueAsync(request.Sku, null, cancellationToken);

        var variant = new ProductVariant
        {
            ProductId = productId,
            Sku = request.Sku,
            Name = BuildVariantName(request.Sku, request.Size, request.Color),
            Size = request.Size,
            Color = request.Color,
            PriceAdjustment = request.PriceAdjustment,
            PriceOverride = request.PriceOverride,
            StockQuantity = request.StockQuantity,
            IsActive = request.IsActive,
        };

        db.ProductVariants.Add(variant);
        await db.SaveChangesAsync(cancellationToken);

        return ToDto(variant);
    }

    public async Task<ProductVariantDto> UpdateVariantAsync(Guid productId, Guid variantId, UpdateProductVariantRequest request, CancellationToken cancellationToken)
    {
        var variant = await db.ProductVariants.FirstOrDefaultAsync(v => v.Id == variantId && v.ProductId == productId, cancellationToken)
                      ?? throw new NotFoundException("ProductVariant", variantId);

        await EnsureSkuIsUniqueAsync(request.Sku, variantId, cancellationToken);

        variant.Sku = request.Sku;
        variant.Name = BuildVariantName(request.Sku, request.Size, request.Color);
        variant.Size = request.Size;
        variant.Color = request.Color;
        variant.PriceAdjustment = request.PriceAdjustment;
        variant.PriceOverride = request.PriceOverride;
        variant.StockQuantity = request.StockQuantity;
        variant.IsActive = request.IsActive;

        await db.SaveChangesAsync(cancellationToken);

        return ToDto(variant);
    }

    public async Task DeleteVariantAsync(Guid productId, Guid variantId, CancellationToken cancellationToken)
    {
        var variant = await db.ProductVariants.FirstOrDefaultAsync(v => v.Id == variantId && v.ProductId == productId, cancellationToken)
                      ?? throw new NotFoundException("ProductVariant", variantId);

        db.ProductVariants.Remove(variant);
        await db.SaveChangesAsync(cancellationToken);
    }

    private async Task EnsureSkuIsUniqueAsync(string sku, Guid? excludingId, CancellationToken cancellationToken)
    {
        var taken = await db.ProductVariants.AnyAsync(v => v.Sku == sku && v.Id != excludingId, cancellationToken);
        if (taken)
        {
            throw new ConflictException($"A variant with SKU '{sku}' already exists.");
        }
    }

    private async Task EnsureProductExistsAsync(Guid productId, CancellationToken cancellationToken)
    {
        var exists = await db.Products.AnyAsync(p => p.Id == productId, cancellationToken);
        if (!exists)
        {
            throw new NotFoundException("Product", productId);
        }
    }

    private static string BuildVariantName(string sku, string? size, string? color)
    {
        var parts = new[] { size, color }.Where(part => !string.IsNullOrWhiteSpace(part));
        var name = string.Join(" / ", parts);
        return string.IsNullOrWhiteSpace(name) ? sku : name;
    }

    private static ProductVariantDto ToDto(ProductVariant v) =>
        new(v.Id, v.Sku, v.Name, v.Size, v.Color, v.PriceAdjustment, v.PriceOverride, v.StockQuantity, v.IsActive);
}
