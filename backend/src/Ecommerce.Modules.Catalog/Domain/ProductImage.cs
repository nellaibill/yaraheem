using Ecommerce.Shared.Kernel;

namespace Ecommerce.Modules.Catalog.Domain;

public class ProductImage : BaseEntity
{
    public Guid ProductId { get; set; }
    public Product Product { get; set; } = null!;

    public required string Url { get; set; }
    public string? AltText { get; set; }
    public int SortOrder { get; set; }
}
