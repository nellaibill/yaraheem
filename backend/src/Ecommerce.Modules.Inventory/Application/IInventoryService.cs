using Ecommerce.Modules.Inventory.Contracts;

namespace Ecommerce.Modules.Inventory.Application;

public interface IInventoryService
{
    Task<InventoryItemDto> AdjustAsync(AdjustInventoryRequest request, CancellationToken cancellationToken);
    Task<IReadOnlyDictionary<Guid, int>> GetAvailableQuantitiesAsync(IEnumerable<Guid> productIds, CancellationToken cancellationToken);
    Task ValidateAndDeductForSaleAsync(IReadOnlyDictionary<Guid, int> productQuantities, string reference, CancellationToken cancellationToken);
}
