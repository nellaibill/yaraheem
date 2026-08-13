using Ecommerce.Shared.Infrastructure.Security;
using Xunit;

namespace Ecommerce.Tests;

public class PasswordHasherTests
{
    private readonly PasswordHasher _hasher = new();

    [Fact]
    public void Hash_ThenVerify_WithCorrectPassword_Succeeds()
    {
        var hash = _hasher.Hash("Admin@123");
        Assert.True(_hasher.Verify(hash, "Admin@123"));
    }

    [Fact]
    public void Hash_ThenVerify_WithWrongPassword_Fails()
    {
        var hash = _hasher.Hash("Admin@123");
        Assert.False(_hasher.Verify(hash, "WrongPassword"));
    }

    [Fact]
    public void Hash_SamePasswordTwice_ProducesDifferentHashes()
    {
        var first = _hasher.Hash("Admin@123");
        var second = _hasher.Hash("Admin@123");
        Assert.NotEqual(first, second);
    }

    [Fact]
    public void Hash_NeverStoresPlaintext()
    {
        var hash = _hasher.Hash("Admin@123");
        Assert.DoesNotContain("Admin@123", hash);
    }
}
