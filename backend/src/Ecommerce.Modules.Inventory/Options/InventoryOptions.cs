namespace Ecommerce.Modules.Inventory.Options;

public sealed class InventoryOptions
{
    public const string SectionName = "Inventory";

    public int LowStockThreshold { get; set; } = 5;
}
