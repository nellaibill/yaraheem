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
        await SeedDemoUserAsync(identityDb, passwordHasher, logger, [Role.WellKnown.Waiter], "waiter1@ecommerce.local", "Demo", "Waiter", cancellationToken);
        await SeedDemoUserAsync(identityDb, passwordHasher, logger, [Role.WellKnown.Kitchen], "kitchen1@ecommerce.local", "Demo", "Kitchen", cancellationToken);
        // Combined account for smaller operations where one person runs both the floor and the
        // kitchen — the Tables/Kitchen tab switcher in StaffLayout already supports any account
        // holding both roles (it was built for Admin), so this only needs the role assignment.
        await SeedDemoUserAsync(identityDb, passwordHasher, logger, [Role.WellKnown.Waiter, Role.WellKnown.Kitchen], "supervisor1@ecommerce.local", "Demo", "Supervisor", cancellationToken);

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
        string[] roleNames,
        string email,
        string firstName,
        string lastName,
        CancellationToken cancellationToken)
    {
        var normalizedNames = roleNames.Select(r => r.ToUpperInvariant()).ToList();
        var roles = await identityDb.Roles.Where(r => normalizedNames.Contains(r.NormalizedName)).ToListAsync(cancellationToken);
        if (roles.Count != roleNames.Length)
        {
            logger.LogWarning("One or more roles ({Roles}) are not seeded — skipping demo user {Email}.", string.Join(", ", roleNames), email);
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
        foreach (var role in roles)
        {
            user.UserRoles.Add(new UserRole { UserId = user.Id, RoleId = role.Id });
        }
        identityDb.Users.Add(user);
        await identityDb.SaveChangesAsync(cancellationToken);
    }
}
