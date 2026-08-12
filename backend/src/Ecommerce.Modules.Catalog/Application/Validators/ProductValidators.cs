using Ecommerce.Modules.Catalog.Contracts;
using FluentValidation;

namespace Ecommerce.Modules.Catalog.Application.Validators;

public sealed class CreateProductRequestValidator : AbstractValidator<CreateProductRequest>
{
    public CreateProductRequestValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Slug).NotEmpty().MaximumLength(200).Matches("^[a-z0-9]+(?:-[a-z0-9]+)*$");
        RuleFor(x => x.Description).MaximumLength(4000);
        RuleFor(x => x.Sku).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Price).GreaterThanOrEqualTo(0);
        RuleFor(x => x.ComparePrice).GreaterThanOrEqualTo(0).When(x => x.ComparePrice.HasValue);
        RuleFor(x => x.ThumbnailUrl).MaximumLength(1000);
        RuleFor(x => x.CategoryId).NotEmpty();
    }
}

public sealed class UpdateProductRequestValidator : AbstractValidator<UpdateProductRequest>
{
    public UpdateProductRequestValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Slug).NotEmpty().MaximumLength(200).Matches("^[a-z0-9]+(?:-[a-z0-9]+)*$");
        RuleFor(x => x.Description).MaximumLength(4000);
        RuleFor(x => x.Price).GreaterThanOrEqualTo(0);
        RuleFor(x => x.ComparePrice).GreaterThanOrEqualTo(0).When(x => x.ComparePrice.HasValue);
        RuleFor(x => x.ThumbnailUrl).MaximumLength(1000);
        RuleFor(x => x.CategoryId).NotEmpty();
    }
}

public sealed class CreateProductImageRequestValidator : AbstractValidator<CreateProductImageRequest>
{
    public CreateProductImageRequestValidator()
    {
        RuleFor(x => x.Url).NotEmpty().MaximumLength(500);
        RuleFor(x => x.AltText).MaximumLength(200);
        RuleFor(x => x.DisplayOrder).GreaterThanOrEqualTo(0);
    }
}

public sealed class ReorderProductImagesRequestValidator : AbstractValidator<ReorderProductImagesRequest>
{
    public ReorderProductImagesRequestValidator()
    {
        RuleFor(x => x.Items).NotNull();
        RuleForEach(x => x.Items).ChildRules(item =>
        {
            item.RuleFor(i => i.ImageId).NotEmpty();
            item.RuleFor(i => i.DisplayOrder).GreaterThanOrEqualTo(0);
        });
    }
}

public sealed class CreateProductVariantRequestValidator : AbstractValidator<CreateProductVariantRequest>
{
    public CreateProductVariantRequestValidator()
    {
        RuleFor(x => x.Sku).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Size).MaximumLength(50);
        RuleFor(x => x.Color).MaximumLength(50);
        RuleFor(x => x.PriceOverride).GreaterThanOrEqualTo(0).When(x => x.PriceOverride.HasValue);
        RuleFor(x => x.StockQuantity).GreaterThanOrEqualTo(0);
    }
}

public sealed class UpdateProductVariantRequestValidator : AbstractValidator<UpdateProductVariantRequest>
{
    public UpdateProductVariantRequestValidator()
    {
        RuleFor(x => x.Sku).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Size).MaximumLength(50);
        RuleFor(x => x.Color).MaximumLength(50);
        RuleFor(x => x.PriceOverride).GreaterThanOrEqualTo(0).When(x => x.PriceOverride.HasValue);
        RuleFor(x => x.StockQuantity).GreaterThanOrEqualTo(0);
    }
}

public sealed class ProductQueryValidator : AbstractValidator<ProductQuery>
{
    private static readonly string[] AllowedSortFields = ["price", "name", "created_at"];

    public ProductQueryValidator()
    {
        RuleFor(x => x.Page).GreaterThanOrEqualTo(1);
        RuleFor(x => x.PageSize).InclusiveBetween(1, 100);
        RuleFor(x => x.SortBy)
            .Must(sortBy => sortBy is null || AllowedSortFields.Contains(sortBy.ToLowerInvariant()))
            .WithMessage("SortBy must be one of: price, name, created_at.");
    }
}
