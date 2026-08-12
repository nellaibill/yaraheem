using Ecommerce.Modules.Catalog.Contracts;
using Ecommerce.Modules.Catalog.Domain;
using Ecommerce.Modules.Catalog.Infrastructure;
using Ecommerce.Shared.Kernel.Exceptions;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Modules.Catalog.Application;

public sealed class ProductImageService(CatalogDbContext db) : IProductImageService
{
    public async Task<IReadOnlyList<ProductImageDto>> GetImagesAsync(Guid productId, CancellationToken cancellationToken)
    {
        await EnsureProductExistsAsync(productId, cancellationToken);

        var images = await db.ProductImages.AsNoTracking()
            .Where(i => i.ProductId == productId)
            .OrderBy(i => i.DisplayOrder)
            .ToListAsync(cancellationToken);

        return images.Select(ToDto).ToList();
    }

    public async Task<ProductImageDto> AddImageAsync(Guid productId, CreateProductImageRequest request, CancellationToken cancellationToken)
    {
        await EnsureProductExistsAsync(productId, cancellationToken);

        var image = new ProductImage
        {
            ProductId = productId,
            ImageUrl = request.Url,
            AltText = request.AltText,
            DisplayOrder = request.DisplayOrder,
            IsPrimary = request.IsPrimary,
        };

        if (image.IsPrimary)
        {
            await ClearPrimaryFlagAsync(productId, cancellationToken);
        }

        db.ProductImages.Add(image);
        await db.SaveChangesAsync(cancellationToken);

        return ToDto(image);
    }

    public async Task DeleteImageAsync(Guid productId, Guid imageId, CancellationToken cancellationToken)
    {
        var image = await db.ProductImages.FirstOrDefaultAsync(i => i.Id == imageId && i.ProductId == productId, cancellationToken)
                    ?? throw new NotFoundException("ProductImage", imageId);

        db.ProductImages.Remove(image);
        await db.SaveChangesAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<ProductImageDto>> ReorderImagesAsync(Guid productId, ReorderProductImagesRequest request, CancellationToken cancellationToken)
    {
        await EnsureProductExistsAsync(productId, cancellationToken);

        var images = await db.ProductImages.Where(i => i.ProductId == productId).ToListAsync(cancellationToken);
        var imagesById = images.ToDictionary(i => i.Id);

        foreach (var entry in request.Items)
        {
            if (imagesById.TryGetValue(entry.ImageId, out var image))
            {
                image.DisplayOrder = entry.DisplayOrder;
            }
        }

        await db.SaveChangesAsync(cancellationToken);

        return images.OrderBy(i => i.DisplayOrder).Select(ToDto).ToList();
    }

    public async Task<ProductImageDto> SetPrimaryImageAsync(Guid productId, Guid imageId, CancellationToken cancellationToken)
    {
        var image = await db.ProductImages.FirstOrDefaultAsync(i => i.Id == imageId && i.ProductId == productId, cancellationToken)
                    ?? throw new NotFoundException("ProductImage", imageId);

        await ClearPrimaryFlagAsync(productId, cancellationToken);

        image.IsPrimary = true;
        await db.SaveChangesAsync(cancellationToken);

        return ToDto(image);
    }

    private async Task ClearPrimaryFlagAsync(Guid productId, CancellationToken cancellationToken)
    {
        var currentPrimary = await db.ProductImages.Where(i => i.ProductId == productId && i.IsPrimary).ToListAsync(cancellationToken);
        foreach (var image in currentPrimary)
        {
            image.IsPrimary = false;
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

    private static ProductImageDto ToDto(ProductImage i) => new(i.Id, i.ImageUrl, i.AltText, i.DisplayOrder, i.IsPrimary);
}
