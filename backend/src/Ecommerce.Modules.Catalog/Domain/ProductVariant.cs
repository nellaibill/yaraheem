using Ecommerce.Shared.Kernel;

namespace Ecommerce.Modules.Catalog.Domain;

public class ProductVariant : BaseEntity
{
    public Guid ProductId { get; set; }
    public Product Product { get; set; } = null!;

    public required string Sku { get; set; }
    public required string Name { get; set; }
    public string? Size { get; set; }
    public string? Color { get; set; }
    public decimal PriceAdjustment { get; set; }
    public decimal? PriceOverride { get; set; }
    public int StockQuantity { get; set; }
    public bool IsActive { get; set; } = true;
}
