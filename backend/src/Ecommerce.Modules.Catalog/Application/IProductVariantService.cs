using Ecommerce.Modules.Catalog.Contracts;

namespace Ecommerce.Modules.Catalog.Application;

public interface IProductVariantService
{
    Task<IReadOnlyList<ProductVariantDto>> GetVariantsAsync(Guid productId, CancellationToken cancellationToken);
    Task<ProductVariantDto> CreateVariantAsync(Guid productId, CreateProductVariantRequest request, CancellationToken cancellationToken);
    Task<ProductVariantDto> UpdateVariantAsync(Guid productId, Guid variantId, UpdateProductVariantRequest request, CancellationToken cancellationToken);
    Task DeleteVariantAsync(Guid productId, Guid variantId, CancellationToken cancellationToken);
}
