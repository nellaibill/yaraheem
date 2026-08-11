using Ecommerce.Modules.Catalog.Contracts;
using Ecommerce.Shared.Kernel;

namespace Ecommerce.Modules.Catalog.Application;

public interface IProductService
{
    Task<PagedResult<ProductDto>> SearchAsync(ProductQuery query, CancellationToken cancellationToken);
    Task<ProductDto> GetByIdAsync(Guid id, CancellationToken cancellationToken);
    Task<ProductDto> CreateAsync(CreateProductRequest request, CancellationToken cancellationToken);
    Task<ProductDto> UpdateAsync(Guid id, UpdateProductRequest request, CancellationToken cancellationToken);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken);
}
