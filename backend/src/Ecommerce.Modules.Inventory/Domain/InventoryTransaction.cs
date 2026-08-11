using Ecommerce.Shared.Kernel;

namespace Ecommerce.Modules.Inventory.Domain;

public class InventoryTransaction : BaseEntity
{
    public Guid InventoryItemId { get; set; }
    public InventoryItem InventoryItem { get; set; } = null!;

    public InventoryTransactionType Type { get; set; }
    public int QuantityChange { get; set; }
    public string? Reference { get; set; }
    public DateTimeOffset OccurredAt { get; set; } = DateTimeOffset.UtcNow;
}
