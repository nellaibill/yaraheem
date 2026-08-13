using Ecommerce.Shared.Infrastructure.Options;
using Ecommerce.Shared.Infrastructure.Pricing;
using Microsoft.Extensions.Options;
using Xunit;

namespace Ecommerce.Tests;

public class DeliveryFeeCalculatorTests
{
    private static DeliveryFeeCalculator CreateCalculator(decimal threshold = 799m, decimal flatFee = 40m) =>
        new(Options.Create(new DeliveryPricingOptions { FreeDeliveryThreshold = threshold, FlatDeliveryFee = flatFee }));

    [Fact]
    public void Calculate_BelowThreshold_ChargesFlatFee()
    {
        var calculator = CreateCalculator();
        Assert.Equal(40m, calculator.Calculate(500m));
    }

    [Fact]
    public void Calculate_AtThreshold_IsFree()
    {
        var calculator = CreateCalculator();
        Assert.Equal(0m, calculator.Calculate(799m));
    }

    [Fact]
    public void Calculate_AboveThreshold_IsFree()
    {
        var calculator = CreateCalculator();
        Assert.Equal(0m, calculator.Calculate(1000m));
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-10)]
    public void Calculate_ZeroOrNegativeSubtotal_IsFree(decimal subtotal)
    {
        var calculator = CreateCalculator();
        Assert.Equal(0m, calculator.Calculate(subtotal));
    }

    [Fact]
    public void Calculate_UsesConfiguredThresholdAndFee()
    {
        var calculator = CreateCalculator(threshold: 500m, flatFee: 25m);
        Assert.Equal(25m, calculator.Calculate(499m));
        Assert.Equal(0m, calculator.Calculate(500m));
    }
}
