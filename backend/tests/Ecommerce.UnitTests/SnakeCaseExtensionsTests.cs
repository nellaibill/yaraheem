using Ecommerce.Shared.Infrastructure.Persistence;

namespace Ecommerce.UnitTests;

public class SnakeCaseExtensionsTests
{
    [Theory]
    [InlineData("ProductVariant", "product_variant")]
    [InlineData("Id", "id")]
    [InlineData("SKU", "sku")]
    [InlineData("already_snake", "already_snake")]
    public void ToSnakeCase_ConvertsPascalCaseToSnakeCase(string input, string expected)
    {
        var result = SnakeCaseExtensions.ToSnakeCase(input);

        Assert.Equal(expected, result);
    }
}
