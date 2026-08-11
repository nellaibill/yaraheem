using Ecommerce.Shared.Kernel;

namespace Ecommerce.Modules.Catalog.Domain;

public class Product : BaseEntity, ISoftDeletable
{
    public Guid CategoryId { get; set; }
    public Category Category { get; set; } = null!;

    public required string Name { get; set; }
    public required string Slug { get; set; }
    public string? Description { get; set; }
    public required string Sku { get; set; }
    public decimal Price { get; set; }
    public bool IsActive { get; set; } = true;

    public ICollection<ProductImage> Images { get; set; } = [];
    public ICollection<ProductVariant> Variants { get; set; } = [];
}
