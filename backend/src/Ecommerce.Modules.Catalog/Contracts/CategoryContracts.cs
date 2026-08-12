namespace Ecommerce.Modules.Catalog.Contracts;

public sealed record CategoryDto(Guid Id, string Name, string Slug, string? Description, string? ImageUrl, Guid? ParentCategoryId, int DisplayOrder, bool IsActive);

public sealed record CreateCategoryRequest(string Name, string Slug, string? Description, string? ImageUrl, Guid? ParentCategoryId, int DisplayOrder = 0);

public sealed record UpdateCategoryRequest(string Name, string Slug, string? Description, string? ImageUrl, Guid? ParentCategoryId, int DisplayOrder, bool IsActive);

public sealed record CategoryTreeNode(Guid Id, string Name, string Slug, string? ImageUrl, int DisplayOrder, IReadOnlyList<CategoryTreeNode> Children);
