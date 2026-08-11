using Ecommerce.Shared.Kernel;

namespace Ecommerce.Modules.Inventory.Domain;

public class InventoryItem : BaseEntity
{
    public Guid ProductId { get; set; }
    public int QuantityOnHand { get; set; }
    public int QuantityReserved { get; set; }
    public int ReorderThreshold { get; set; } = 10;

    public int QuantityAvailable => QuantityOnHand - QuantityReserved;

    public ICollection<InventoryTransaction> Transactions { get; set; } = [];
}
