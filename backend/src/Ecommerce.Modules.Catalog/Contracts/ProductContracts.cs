namespace Ecommerce.Modules.Catalog.Contracts;

public sealed record ProductImageDto(Guid Id, string Url, string? AltText, int SortOrder);

public sealed record ProductVariantDto(Guid Id, string Sku, string Name, decimal PriceAdjustment, bool IsActive);

public sealed record ProductDto(
    Guid Id,
    string Name,
    string Slug,
    string? Description,
    string Sku,
    decimal Price,
    bool IsActive,
    Guid CategoryId,
    string CategoryName,
    IReadOnlyList<ProductImageDto> Images,
    IReadOnlyList<ProductVariantDto> Variants);

public sealed record CreateProductRequest(string Name, string Slug, string? Description, string Sku, decimal Price, Guid CategoryId);

public sealed record UpdateProductRequest(string Name, string Slug, string? Description, decimal Price, Guid CategoryId, bool IsActive);

public sealed record ProductQuery(string? Search, Guid? CategoryId, bool? IsActive, int Page = 1, int PageSize = 20);
