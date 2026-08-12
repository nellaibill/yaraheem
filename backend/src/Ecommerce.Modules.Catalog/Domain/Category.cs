using Ecommerce.Shared.Kernel;

namespace Ecommerce.Modules.Catalog.Domain;

public class Category : BaseEntity, ISoftDeletable
{
    public required string Name { get; set; }
    public required string Slug { get; set; }
    public string? Description { get; set; }
    public Guid? ParentCategoryId { get; set; }
    public Category? ParentCategory { get; set; }
    public string? ImageUrl { get; set; }
    public int DisplayOrder { get; set; }
    public bool IsActive { get; set; } = true;

    public ICollection<Category> ChildCategories { get; set; } = [];
    public ICollection<Product> Products { get; set; } = [];
}
