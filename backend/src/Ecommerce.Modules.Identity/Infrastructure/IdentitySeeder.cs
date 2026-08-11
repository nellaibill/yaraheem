using Ecommerce.Modules.Identity.Domain;
using Ecommerce.Shared.Infrastructure.Options;
using Ecommerce.Shared.Infrastructure.Security;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace Ecommerce.Modules.Identity.Infrastructure;

public static class IdentitySeeder
{
    public static async Task SeedAsync(IdentityDbContext db, IPasswordHasher passwordHasher, IOptions<AdminSeedOptions> adminSeedOptions, CancellationToken cancellationToken = default)
    {
        var roles = new[] { Role.WellKnown.Admin, Role.WellKnown.Customer };
        foreach (var roleName in roles)
        {
            var normalized = roleName.ToUpperInvariant();
            var exists = await db.Roles.AnyAsync(r => r.NormalizedName == normalized, cancellationToken);
            if (!exists)
            {
                db.Roles.Add(new Role { Name = roleName, NormalizedName = normalized });
            }
        }

        await db.SaveChangesAsync(cancellationToken);

        var adminSeed = adminSeedOptions.Value;
        var normalizedEmail = adminSeed.Email.Trim().ToLowerInvariant();
        var adminExists = await db.Users.AnyAsync(u => u.Email == normalizedEmail, cancellationToken);
        if (!adminExists)
        {
            var adminRole = await db.Roles.FirstAsync(r => r.NormalizedName == Role.WellKnown.Admin.ToUpperInvariant(), cancellationToken);

            var admin = new User
            {
                Email = normalizedEmail,
                PasswordHash = passwordHasher.Hash(adminSeed.Password),
                FirstName = adminSeed.FirstName,
                LastName = adminSeed.LastName,
            };
            admin.UserRoles.Add(new UserRole { UserId = admin.Id, RoleId = adminRole.Id });

            db.Users.Add(admin);
            await db.SaveChangesAsync(cancellationToken);
        }

        var customerRole = await db.Roles.FirstAsync(r => r.NormalizedName == Role.WellKnown.Customer.ToUpperInvariant(), cancellationToken);

        var demoCustomers = new[]
        {
            ("customer1@ecommerce.local", "Demo", "Customer1"),
            ("customer2@ecommerce.local", "Demo", "Customer2"),
        };

        foreach (var (email, firstName, lastName) in demoCustomers)
        {
            var exists = await db.Users.AnyAsync(u => u.Email == email, cancellationToken);
            if (exists)
            {
                continue;
            }

            var customer = new User
            {
                Email = email,
                PasswordHash = passwordHasher.Hash("Admin@123"),
                FirstName = firstName,
                LastName = lastName,
            };
            customer.UserRoles.Add(new UserRole { UserId = customer.Id, RoleId = customerRole.Id });

            db.Users.Add(customer);
        }

        await db.SaveChangesAsync(cancellationToken);
    }
}
