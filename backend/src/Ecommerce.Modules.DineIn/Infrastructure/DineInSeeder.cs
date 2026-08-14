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
        var role = await identityDb.Roles.FirstOrDefaultAsync(r => r.NormalizedName == Role.WellKnown.Waiter.ToUpperInvariant(), cancellationToken);
        if (role is null)
        {
            logger.LogWarning("Waiter role is not seeded — skipping demo waiter seeding.");
        }
        else
        {
            const string email = "waiter1@ecommerce.local";
            var user = await identityDb.Users.FirstOrDefaultAsync(u => u.Email == email, cancellationToken);
            if (user is null)
            {
                user = new User
                {
                    Email = email,
                    PasswordHash = passwordHasher.Hash("Admin@123"),
                    FirstName = "Demo",
                    LastName = "Waiter",
                };
                user.UserRoles.Add(new UserRole { UserId = user.Id, RoleId = role.Id });
                identityDb.Users.Add(user);
                await identityDb.SaveChangesAsync(cancellationToken);
            }
        }

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
}
