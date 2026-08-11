using Ecommerce.Modules.Catalog.Contracts;
using Ecommerce.Shared.Kernel;

namespace Ecommerce.Modules.Catalog.Application;

public interface IProductService
{
    Task<PagedResult<ProductListResponse>> SearchAsync(ProductQuery query, CancellationToken cancellationToken);
    Task<ProductDetailsResponse> GetByIdAsync(Guid id, CancellationToken cancellationToken);
    Task<ProductDetailsResponse> GetBySlugAsync(string slug, CancellationToken cancellationToken);
    Task<IReadOnlyList<ProductListResponse>> GetFeaturedAsync(int take, CancellationToken cancellationToken);
    Task<ProductDetailsResponse> CreateAsync(CreateProductRequest request, CancellationToken cancellationToken);
    Task<ProductDetailsResponse> UpdateAsync(Guid id, UpdateProductRequest request, CancellationToken cancellationToken);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken);
}
