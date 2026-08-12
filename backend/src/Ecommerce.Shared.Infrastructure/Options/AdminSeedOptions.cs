namespace Ecommerce.Shared.Infrastructure.Options;

public sealed class AdminSeedOptions
{
    public const string SectionName = "AdminSeed";

    public string Email { get; set; } = "admin@ecommerce.local";

    /// <summary>
    /// No default on purpose — an empty value means IdentitySeeder skips seeding the admin
    /// account rather than falling back to a hardcoded password. Supply via user-secrets
    /// (dev) or the AdminSeed__Password environment variable.
    /// </summary>
    public string Password { get; set; } = string.Empty;
    public string FirstName { get; set; } = "System";
    public string LastName { get; set; } = "Admin";
}
