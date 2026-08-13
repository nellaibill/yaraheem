using Ecommerce.Modules.Orders.Application.Validators;
using Ecommerce.Modules.Orders.Contracts;
using Ecommerce.Modules.Orders.Domain;
using Xunit;

namespace Ecommerce.Tests;

public class OrderValidatorTests
{
    private static readonly ShippingAddressRequest ValidAddress = new(
        "Jane Doe", "9876543210", "12 Main St", null, "Tirunelveli", "Tamil Nadu", "627005", "India");

    private readonly CheckoutRequestValidator _checkoutValidator = new();
    private readonly UpdateOrderStatusRequestValidator _statusValidator = new();

    [Theory]
    [InlineData("COD")]
    [InlineData("ONLINE")]
    public void Checkout_AllowedPaymentMethods_Pass(string method)
    {
        var request = new CheckoutRequest(method, ValidAddress);
        Assert.True(_checkoutValidator.Validate(request).IsValid);
    }

    [Theory]
    [InlineData("CASH")]
    [InlineData("")]
    [InlineData("cod")]
    public void Checkout_DisallowedPaymentMethods_Fail(string method)
    {
        var request = new CheckoutRequest(method, ValidAddress);
        Assert.False(_checkoutValidator.Validate(request).IsValid);
    }

    [Fact]
    public void Checkout_MissingAddressFields_Fail()
    {
        var incomplete = ValidAddress with { FullName = "" };
        var request = new CheckoutRequest("COD", incomplete);
        Assert.False(_checkoutValidator.Validate(request).IsValid);
    }

    [Fact]
    public void UpdateStatus_ValidEnumValue_Passes()
    {
        var request = new UpdateOrderStatusRequest(OrderStatus.Confirmed, "ok");
        Assert.True(_statusValidator.Validate(request).IsValid);
    }

    [Fact]
    public void UpdateStatus_NotesTooLong_Fails()
    {
        var request = new UpdateOrderStatusRequest(OrderStatus.Confirmed, new string('x', 501));
        Assert.False(_statusValidator.Validate(request).IsValid);
    }
}
