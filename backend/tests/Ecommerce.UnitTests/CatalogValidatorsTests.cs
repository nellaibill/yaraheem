using Ecommerce.Modules.Catalog.Application.Validators;
using Ecommerce.Modules.Catalog.Contracts;

namespace Ecommerce.UnitTests;

public class CatalogValidatorsTests
{
    [Fact]
    public void CreateProductRequestValidator_RejectsNegativePrice()
    {
        var validator = new CreateProductRequestValidator();
        var request = new CreateProductRequest("Name", "slug", null, "SKU-1", -5m, Guid.NewGuid());

        var result = validator.Validate(request);

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, e => e.PropertyName == nameof(CreateProductRequest.Price));
    }

    [Fact]
    public void CreateProductRequestValidator_RejectsInvalidSlug()
    {
        var validator = new CreateProductRequestValidator();
        var request = new CreateProductRequest("Name", "Not A Valid Slug!", null, "SKU-1", 10m, Guid.NewGuid());

        var result = validator.Validate(request);

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, e => e.PropertyName == nameof(CreateProductRequest.Slug));
    }

    [Fact]
    public void CreateProductRequestValidator_AcceptsValidRequest()
    {
        var validator = new CreateProductRequestValidator();
        var request = new CreateProductRequest("Name", "valid-slug", "desc", "SKU-1", 10m, Guid.NewGuid());

        var result = validator.Validate(request);

        Assert.True(result.IsValid);
    }
}
