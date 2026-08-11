namespace Ecommerce.Shared.Infrastructure.Options;

public sealed class AdminSeedOptions
{
    public const string SectionName = "AdminSeed";

    public string Email { get; set; } = "admin@ecommerce.local";
    public string Password { get; set; } = "Admin@12345";
    public string FirstName { get; set; } = "System";
    public string LastName { get; set; } = "Admin";
}
