using Ecommerce.Modules.Inventory.Contracts;
using Ecommerce.Shared.Kernel;

namespace Ecommerce.Modules.Inventory.Application;

public interface IInventoryService
{
    Task<InventoryItemDto> AdjustAsync(AdjustInventoryRequest request, CancellationToken cancellationToken);
    Task<IReadOnlyDictionary<Guid, int>> GetAvailableQuantitiesAsync(IEnumerable<Guid> productIds, CancellationToken cancellationToken);
    Task ValidateAndDeductForSaleAsync(IReadOnlyDictionary<Guid, int> productQuantities, string reference, CancellationToken cancellationToken);
    Task<PagedResult<InventoryItemDto>> GetAllAsync(int page, int pageSize, CancellationToken cancellationToken);
    Task<IReadOnlyList<InventoryItemDto>> GetLowStockAsync(int threshold, CancellationToken cancellationToken);
    Task<InventoryItemDto> SetStockAsync(Guid productId, int quantity, CancellationToken cancellationToken);
    Task<InventoryItemDto> CreateAdjustmentAsync(CreateInventoryAdjustmentRequest request, CancellationToken cancellationToken);
}
