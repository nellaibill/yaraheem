namespace Ecommerce.Modules.Catalog.Contracts;

public sealed record ProductImageDto(Guid Id, string Url, string? AltText, int SortOrder);

public sealed record ProductVariantDto(Guid Id, string Sku, string Name, decimal PriceAdjustment, bool IsActive);

public sealed record ProductListResponse(
    Guid Id,
    string Name,
    string Slug,
    string Sku,
    decimal Price,
    decimal? ComparePrice,
    string? ThumbnailUrl,
    bool IsFeatured,
    bool IsPublished,
    int StockQuantity,
    Guid CategoryId,
    string CategoryName);

public sealed record ProductDetailsResponse(
    Guid Id,
    string Name,
    string Slug,
    string? Description,
    string Sku,
    decimal Price,
    decimal? ComparePrice,
    string? ThumbnailUrl,
    bool IsFeatured,
    bool IsPublished,
    bool IsActive,
    int StockQuantity,
    Guid CategoryId,
    string CategoryName,
    IReadOnlyList<ProductImageDto> Images,
    IReadOnlyList<ProductVariantDto> Variants);

public sealed record CreateProductRequest(
    string Name,
    string Slug,
    string? Description,
    string Sku,
    decimal Price,
    decimal? ComparePrice,
    string? ThumbnailUrl,
    Guid CategoryId,
    bool IsFeatured = false,
    bool IsPublished = true);

public sealed record UpdateProductRequest(
    string Name,
    string Slug,
    string? Description,
    decimal Price,
    decimal? ComparePrice,
    string? ThumbnailUrl,
    Guid CategoryId,
    bool IsFeatured,
    bool IsPublished,
    bool IsActive);

public sealed record ProductQuery(
    string? Search,
    Guid? CategoryId,
    bool? IsActive,
    string? SortBy = null,
    bool SortDescending = false,
    int Page = 1,
    int PageSize = 20);
