namespace Ecommerce.Modules.Catalog.Contracts;

public sealed record CategoryDto(Guid Id, string Name, string Slug, string? Description, Guid? ParentCategoryId, bool IsActive);

public sealed record CreateCategoryRequest(string Name, string Slug, string? Description, Guid? ParentCategoryId);

public sealed record UpdateCategoryRequest(string Name, string Slug, string? Description, Guid? ParentCategoryId, bool IsActive);
