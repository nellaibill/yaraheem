using Ecommerce.Modules.Catalog.Contracts;

namespace Ecommerce.Modules.Catalog.Application;

public interface IProductImageService
{
    Task<IReadOnlyList<ProductImageDto>> GetImagesAsync(Guid productId, CancellationToken cancellationToken);
    Task<ProductImageDto> AddImageAsync(Guid productId, CreateProductImageRequest request, CancellationToken cancellationToken);
    Task DeleteImageAsync(Guid productId, Guid imageId, CancellationToken cancellationToken);
    Task<IReadOnlyList<ProductImageDto>> ReorderImagesAsync(Guid productId, ReorderProductImagesRequest request, CancellationToken cancellationToken);
    Task<ProductImageDto> SetPrimaryImageAsync(Guid productId, Guid imageId, CancellationToken cancellationToken);
}
