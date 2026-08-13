using Ecommerce.Modules.Audit.Application;
using Ecommerce.Modules.Catalog.Contracts;
using Ecommerce.Modules.Catalog.Domain;
using Ecommerce.Modules.Catalog.Infrastructure;
using Ecommerce.Modules.Inventory.Infrastructure;
using Ecommerce.Shared.Kernel;
using Ecommerce.Shared.Kernel.Exceptions;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Modules.Catalog.Application;

public sealed class ProductService(CatalogDbContext db, InventoryDbContext inventoryDb, IAuditLogService auditLog) : IProductService
{
    public async Task<PagedResult<ProductListResponse>> SearchAsync(ProductQuery query, CancellationToken cancellationToken)
    {
        var productsQuery = db.Products.AsNoTracking().Include(p => p.Category).AsQueryable();

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

        productsQuery = query.SortBy?.ToLowerInvariant() switch
        {
            "price" => query.SortDescending ? productsQuery.OrderByDescending(p => p.Price) : productsQuery.OrderBy(p => p.Price),
            "created_at" => query.SortDescending ? productsQuery.OrderByDescending(p => p.CreatedAt) : productsQuery.OrderBy(p => p.CreatedAt),
            _ => query.SortDescending ? productsQuery.OrderByDescending(p => p.Name) : productsQuery.OrderBy(p => p.Name),
        };

        var totalCount = await productsQuery.CountAsync(cancellationToken);

        var products = await productsQuery
            .Skip((query.Page - 1) * query.PageSize)
            .Take(query.PageSize)
            .ToListAsync(cancellationToken);

        var stock = await GetStockAsync(products.Select(p => p.Id), cancellationToken);

        return new PagedResult<ProductListResponse>
        {
            Items = products.Select(p => ToListResponse(p, stock)).ToList(),
            Page = query.Page,
            PageSize = query.PageSize,
            TotalCount = totalCount,
        };
    }

    public async Task<ProductDetailsResponse> GetByIdAsync(Guid id, CancellationToken cancellationToken)
    {
        var product = await LoadDetailsQuery().FirstOrDefaultAsync(p => p.Id == id, cancellationToken)
                      ?? throw new NotFoundException("Product", id);

        var stock = await GetStockAsync([product.Id], cancellationToken);
        return ToDetailsResponse(product, stock);
    }

    public async Task<ProductDetailsResponse> GetBySlugAsync(string slug, CancellationToken cancellationToken)
    {
        var product = await LoadDetailsQuery().FirstOrDefaultAsync(p => p.Slug == slug, cancellationToken)
                      ?? throw new NotFoundException("Product", slug);

        var stock = await GetStockAsync([product.Id], cancellationToken);
        return ToDetailsResponse(product, stock);
    }

    public async Task<IReadOnlyList<ProductListResponse>> GetFeaturedAsync(int take, CancellationToken cancellationToken)
    {
        var products = await db.Products.AsNoTracking()
            .Include(p => p.Category)
            .Where(p => p.IsFeatured && p.IsPublished && p.IsActive)
            .OrderByDescending(p => p.CreatedAt)
            .Take(take)
            .ToListAsync(cancellationToken);

        var stock = await GetStockAsync(products.Select(p => p.Id), cancellationToken);
        return products.Select(p => ToListResponse(p, stock)).ToList();
    }

    public async Task<ProductDetailsResponse> CreateAsync(CreateProductRequest request, CancellationToken cancellationToken)
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
            ComparePrice = request.ComparePrice,
            ThumbnailUrl = request.ThumbnailUrl,
            CategoryId = request.CategoryId,
            IsFeatured = request.IsFeatured,
            IsPublished = request.IsPublished,
        };

        db.Products.Add(product);
        await db.SaveChangesAsync(cancellationToken);

        await auditLog.LogAsync("Product.Created", "Product", product.Id.ToString(), $"Created '{product.Name}' (SKU {product.Sku})", cancellationToken);

        return await GetByIdAsync(product.Id, cancellationToken);
    }

    public async Task<ProductDetailsResponse> UpdateAsync(Guid id, UpdateProductRequest request, CancellationToken cancellationToken)
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
        product.ComparePrice = request.ComparePrice;
        product.ThumbnailUrl = request.ThumbnailUrl;
        product.CategoryId = request.CategoryId;
        product.IsFeatured = request.IsFeatured;
        product.IsPublished = request.IsPublished;
        product.IsActive = request.IsActive;

        await db.SaveChangesAsync(cancellationToken);

        await auditLog.LogAsync("Product.Updated", "Product", product.Id.ToString(), $"Updated '{product.Name}'", cancellationToken);

        return await GetByIdAsync(product.Id, cancellationToken);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken)
    {
        var product = await db.Products.FirstOrDefaultAsync(p => p.Id == id, cancellationToken)
                      ?? throw new NotFoundException("Product", id);

        db.Products.Remove(product);
        await db.SaveChangesAsync(cancellationToken);

        await auditLog.LogAsync("Product.Deleted", "Product", id.ToString(), $"Deleted '{product.Name}'", cancellationToken);
    }

    private IQueryable<Product> LoadDetailsQuery() =>
        db.Products.AsNoTracking().Include(p => p.Category).Include(p => p.Images).Include(p => p.Variants);

    private async Task<Dictionary<Guid, int>> GetStockAsync(IEnumerable<Guid> productIds, CancellationToken cancellationToken)
    {
        var ids = productIds.Distinct().ToList();
        var items = await inventoryDb.InventoryItems.AsNoTracking()
            .Where(i => ids.Contains(i.ProductId))
            .ToListAsync(cancellationToken);

        return items.ToDictionary(i => i.ProductId, i => i.QuantityAvailable);
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

    private static ProductListResponse ToListResponse(Product p, IReadOnlyDictionary<Guid, int> stock) => new(
        p.Id, p.Name, p.Slug, p.Sku, p.Price, p.ComparePrice, p.ThumbnailUrl, p.IsFeatured, p.IsPublished,
        stock.GetValueOrDefault(p.Id), p.CategoryId, p.Category.Name);

    private static ProductDetailsResponse ToDetailsResponse(Product p, IReadOnlyDictionary<Guid, int> stock) => new(
        p.Id, p.Name, p.Slug, p.Description, p.Sku, p.Price, p.ComparePrice, p.ThumbnailUrl, p.IsFeatured, p.IsPublished, p.IsActive,
        stock.GetValueOrDefault(p.Id), p.CategoryId, p.Category.Name,
        p.Images.OrderBy(i => i.DisplayOrder).Select(i => new ProductImageDto(i.Id, i.ImageUrl, i.AltText, i.DisplayOrder, i.IsPrimary)).ToList(),
        p.Variants.Select(v => new ProductVariantDto(v.Id, v.Sku, v.Name, v.Size, v.Color, v.PriceAdjustment, v.PriceOverride, v.StockQuantity, v.IsActive)).ToList());
}
