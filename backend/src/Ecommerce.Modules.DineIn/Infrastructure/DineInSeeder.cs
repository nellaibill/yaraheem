using Ecommerce.Modules.DineIn.Domain;
using Ecommerce.Modules.Identity.Domain;
using Ecommerce.Modules.Identity.Infrastructure;
using Ecommerce.Shared.Infrastructure.Security;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Ecommerce.Modules.DineIn.Infrastructure;

public static class DineInSeeder
{
    public static async Task SeedAsync(IdentityDbContext identityDb, DineInDbContext dineInDb, IPasswordHasher passwordHasher, ILogger logger, CancellationToken cancellationToken = default)
    {
        await SeedDemoUserAsync(identityDb, passwordHasher, logger, Role.WellKnown.Waiter, "waiter1@ecommerce.local", "Demo", "Waiter", cancellationToken);
        await SeedDemoUserAsync(identityDb, passwordHasher, logger, Role.WellKnown.Kitchen, "kitchen1@ecommerce.local", "Demo", "Kitchen", cancellationToken);

        if (!await dineInDb.DiningTables.AnyAsync(cancellationToken))
        {
            var tables = Enumerable.Range(1, 8).Select(n => new DiningTable
            {
                Label = $"Table {n}",
                Capacity = n % 3 == 0 ? 6 : 4,
            });
            dineInDb.DiningTables.AddRange(tables);
            await dineInDb.SaveChangesAsync(cancellationToken);
        }
    }

    private static async Task SeedDemoUserAsync(
        IdentityDbContext identityDb,
        IPasswordHasher passwordHasher,
        ILogger logger,
        string roleName,
        string email,
        string firstName,
        string lastName,
        CancellationToken cancellationToken)
    {
        var role = await identityDb.Roles.FirstOrDefaultAsync(r => r.NormalizedName == roleName.ToUpperInvariant(), cancellationToken);
        if (role is null)
        {
            logger.LogWarning("{Role} role is not seeded — skipping demo {Role} seeding.", roleName, roleName);
            return;
        }

        var user = await identityDb.Users.FirstOrDefaultAsync(u => u.Email == email, cancellationToken);
        if (user is not null) return;

        user = new User
        {
            Email = email,
            PasswordHash = passwordHasher.Hash("Admin@123"),
            FirstName = firstName,
            LastName = lastName,
        };
        user.UserRoles.Add(new UserRole { UserId = user.Id, RoleId = role.Id });
        identityDb.Users.Add(user);
        await identityDb.SaveChangesAsync(cancellationToken);
    }
}
