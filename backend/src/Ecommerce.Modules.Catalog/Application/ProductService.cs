using Ecommerce.Modules.Catalog.Contracts;
using Ecommerce.Modules.Catalog.Domain;
using Ecommerce.Modules.Catalog.Infrastructure;
using Ecommerce.Shared.Kernel;
using Ecommerce.Shared.Kernel.Exceptions;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Modules.Catalog.Application;

public sealed class ProductService(CatalogDbContext db) : IProductService
{
    public async Task<PagedResult<ProductDto>> SearchAsync(ProductQuery query, CancellationToken cancellationToken)
    {
        var productsQuery = db.Products.AsNoTracking()
            .Include(p => p.Category)
            .Include(p => p.Images)
            .Include(p => p.Variants)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var search = query.Search.Trim();
            productsQuery = productsQuery.Where(p => EF.Functions.ILike(p.Name, $"%{search}%"));
        }

        if (query.CategoryId.HasValue)
        {
            productsQuery = productsQuery.Where(p => p.CategoryId == query.CategoryId.Value);
        }

        if (query.IsActive.HasValue)
        {
            productsQuery = productsQuery.Where(p => p.IsActive == query.IsActive.Value);
        }

        var totalCount = await productsQuery.CountAsync(cancellationToken);

        var products = await productsQuery
            .OrderBy(p => p.Name)
            .Skip((query.Page - 1) * query.PageSize)
            .Take(query.PageSize)
            .ToListAsync(cancellationToken);

        return new PagedResult<ProductDto>
        {
            Items = products.Select(ToDto).ToList(),
            Page = query.Page,
            PageSize = query.PageSize,
            TotalCount = totalCount,
        };
    }

    public async Task<ProductDto> GetByIdAsync(Guid id, CancellationToken cancellationToken)
    {
        var product = await db.Products.AsNoTracking()
            .Include(p => p.Category)
            .Include(p => p.Images)
            .Include(p => p.Variants)
            .FirstOrDefaultAsync(p => p.Id == id, cancellationToken)
            ?? throw new NotFoundException("Product", id);

        return ToDto(product);
    }

    public async Task<ProductDto> CreateAsync(CreateProductRequest request, CancellationToken cancellationToken)
    {
        await EnsureSkuIsUniqueAsync(request.Sku, null, cancellationToken);
        await EnsureSlugIsUniqueAsync(request.Slug, null, cancellationToken);

        var categoryExists = await db.Categories.AnyAsync(c => c.Id == request.CategoryId, cancellationToken);
        if (!categoryExists)
        {
            throw new NotFoundException("Category", request.CategoryId);
        }

        var product = new Product
        {
            Name = request.Name,
            Slug = request.Slug,
            Description = request.Description,
            Sku = request.Sku,
            Price = request.Price,
            CategoryId = request.CategoryId,
        };

        db.Products.Add(product);
        await db.SaveChangesAsync(cancellationToken);

        return await GetByIdAsync(product.Id, cancellationToken);
    }

    public async Task<ProductDto> UpdateAsync(Guid id, UpdateProductRequest request, CancellationToken cancellationToken)
    {
        var product = await db.Products.FirstOrDefaultAsync(p => p.Id == id, cancellationToken)
                      ?? throw new NotFoundException("Product", id);

        await EnsureSlugIsUniqueAsync(request.Slug, id, cancellationToken);

        var categoryExists = await db.Categories.AnyAsync(c => c.Id == request.CategoryId, cancellationToken);
        if (!categoryExists)
        {
            throw new NotFoundException("Category", request.CategoryId);
        }

        product.Name = request.Name;
        product.Slug = request.Slug;
        product.Description = request.Description;
        product.Price = request.Price;
        product.CategoryId = request.CategoryId;
        product.IsActive = request.IsActive;

        await db.SaveChangesAsync(cancellationToken);

        return await GetByIdAsync(product.Id, cancellationToken);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken)
    {
        var product = await db.Products.FirstOrDefaultAsync(p => p.Id == id, cancellationToken)
                      ?? throw new NotFoundException("Product", id);

        db.Products.Remove(product);
        await db.SaveChangesAsync(cancellationToken);
    }

    private async Task EnsureSkuIsUniqueAsync(string sku, Guid? excludingId, CancellationToken cancellationToken)
    {
        var taken = await db.Products.AnyAsync(p => p.Sku == sku && p.Id != excludingId, cancellationToken);
        if (taken)
        {
            throw new ConflictException($"A product with SKU '{sku}' already exists.");
        }
    }

    private async Task EnsureSlugIsUniqueAsync(string slug, Guid? excludingId, CancellationToken cancellationToken)
    {
        var taken = await db.Products.AnyAsync(p => p.Slug == slug && p.Id != excludingId, cancellationToken);
        if (taken)
        {
            throw new ConflictException($"A product with slug '{slug}' already exists.");
        }
    }

    private static ProductDto ToDto(Product p) => new(
        p.Id, p.Name, p.Slug, p.Description, p.Sku, p.Price, p.IsActive, p.CategoryId, p.Category.Name,
        p.Images.OrderBy(i => i.SortOrder).Select(i => new ProductImageDto(i.Id, i.Url, i.AltText, i.SortOrder)).ToList(),
        p.Variants.Select(v => new ProductVariantDto(v.Id, v.Sku, v.Name, v.PriceAdjustment, v.IsActive)).ToList());
}
