using Ecommerce.Modules.Identity.Application.Validators;
using Ecommerce.Modules.Identity.Contracts;
using Xunit;

namespace Ecommerce.Tests;

public class AuthValidatorTests
{
    private readonly RegisterRequestValidator _registerValidator = new();
    private readonly LoginRequestValidator _loginValidator = new();

    [Fact]
    public void Register_ValidRequest_Passes()
    {
        var request = new RegisterRequest("customer@example.com", "Str0ngPass", "Jane", "Doe", null);
        Assert.True(_registerValidator.Validate(request).IsValid);
    }

    [Theory]
    [InlineData("not-an-email", "Str0ngPass")]
    [InlineData("customer@example.com", "short1A")]
    [InlineData("customer@example.com", "nouppercase1")]
    [InlineData("customer@example.com", "NOLOWERCASE1")]
    [InlineData("customer@example.com", "NoDigitsHere")]
    public void Register_InvalidEmailOrWeakPassword_Fails(string email, string password)
    {
        var request = new RegisterRequest(email, password, "Jane", "Doe", null);
        Assert.False(_registerValidator.Validate(request).IsValid);
    }

    [Fact]
    public void Login_MissingPassword_Fails()
    {
        var request = new LoginRequest("customer@example.com", "");
        Assert.False(_loginValidator.Validate(request).IsValid);
    }
}
