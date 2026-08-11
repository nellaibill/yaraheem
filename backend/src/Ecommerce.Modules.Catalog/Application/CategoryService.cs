using Ecommerce.Modules.Catalog.Contracts;
using Ecommerce.Modules.Catalog.Domain;
using Ecommerce.Modules.Catalog.Infrastructure;
using Ecommerce.Shared.Kernel.Exceptions;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Modules.Catalog.Application;

public sealed class CategoryService(CatalogDbContext db) : ICategoryService
{
    public async Task<IReadOnlyList<CategoryDto>> GetAllAsync(CancellationToken cancellationToken)
    {
        var categories = await db.Categories.AsNoTracking().OrderBy(c => c.Name).ToListAsync(cancellationToken);
        return categories.Select(ToDto).ToList();
    }

    public async Task<CategoryDto> GetByIdAsync(Guid id, CancellationToken cancellationToken)
    {
        var category = await db.Categories.AsNoTracking().FirstOrDefaultAsync(c => c.Id == id, cancellationToken)
                        ?? throw new NotFoundException("Category", id);
        return ToDto(category);
    }

    public async Task<CategoryDto> CreateAsync(CreateCategoryRequest request, CancellationToken cancellationToken)
    {
        await EnsureSlugIsUniqueAsync(request.Slug, null, cancellationToken);
        await EnsureParentExistsAsync(request.ParentCategoryId, cancellationToken);

        var category = new Category
        {
            Name = request.Name,
            Slug = request.Slug,
            Description = request.Description,
            ParentCategoryId = request.ParentCategoryId,
            DisplayOrder = request.DisplayOrder,
        };

        db.Categories.Add(category);
        await db.SaveChangesAsync(cancellationToken);

        return ToDto(category);
    }

    public async Task<CategoryDto> UpdateAsync(Guid id, UpdateCategoryRequest request, CancellationToken cancellationToken)
    {
        var category = await db.Categories.FirstOrDefaultAsync(c => c.Id == id, cancellationToken)
                        ?? throw new NotFoundException("Category", id);

        await EnsureSlugIsUniqueAsync(request.Slug, id, cancellationToken);
        await EnsureParentExistsAsync(request.ParentCategoryId, cancellationToken);

        category.Name = request.Name;
        category.Slug = request.Slug;
        category.Description = request.Description;
        category.ParentCategoryId = request.ParentCategoryId;
        category.DisplayOrder = request.DisplayOrder;
        category.IsActive = request.IsActive;

        await db.SaveChangesAsync(cancellationToken);

        return ToDto(category);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken)
    {
        var category = await db.Categories.FirstOrDefaultAsync(c => c.Id == id, cancellationToken)
                        ?? throw new NotFoundException("Category", id);

        db.Categories.Remove(category);
        await db.SaveChangesAsync(cancellationToken);
    }

    private async Task EnsureSlugIsUniqueAsync(string slug, Guid? excludingId, CancellationToken cancellationToken)
    {
        var slugTaken = await db.Categories.AnyAsync(c => c.Slug == slug && c.Id != excludingId, cancellationToken);
        if (slugTaken)
        {
            throw new ConflictException($"A category with slug '{slug}' already exists.");
        }
    }

    private async Task EnsureParentExistsAsync(Guid? parentCategoryId, CancellationToken cancellationToken)
    {
        if (parentCategoryId is null) return;
        var exists = await db.Categories.AnyAsync(c => c.Id == parentCategoryId, cancellationToken);
        if (!exists)
        {
            throw new NotFoundException("Category", parentCategoryId);
        }
    }

    public async Task<IReadOnlyList<CategoryTreeNode>> GetTreeAsync(CancellationToken cancellationToken)
    {
        var categories = await db.Categories.AsNoTracking()
            .Where(c => c.IsActive)
            .OrderBy(c => c.DisplayOrder).ThenBy(c => c.Name)
            .ToListAsync(cancellationToken);

        var byParent = categories.ToLookup(c => c.ParentCategoryId);

        IReadOnlyList<CategoryTreeNode> BuildChildren(Guid? parentId) =>
            byParent[parentId].Select(c => new CategoryTreeNode(c.Id, c.Name, c.Slug, c.DisplayOrder, BuildChildren(c.Id))).ToList();

        return BuildChildren(null);
    }

    private static CategoryDto ToDto(Category c) => new(c.Id, c.Name, c.Slug, c.Description, c.ParentCategoryId, c.DisplayOrder, c.IsActive);
}
