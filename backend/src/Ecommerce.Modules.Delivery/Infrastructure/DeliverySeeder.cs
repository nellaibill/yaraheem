using Ecommerce.Modules.Delivery.Domain;
using Ecommerce.Modules.Identity.Domain;
using Ecommerce.Modules.Identity.Infrastructure;
using Ecommerce.Shared.Infrastructure.Security;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Ecommerce.Modules.Delivery.Infrastructure;

public static class DeliverySeeder
{
    public static async Task SeedAsync(IdentityDbContext identityDb, DeliveryDbContext deliveryDb, IPasswordHasher passwordHasher, ILogger logger, CancellationToken cancellationToken = default)
    {
        var role = await identityDb.Roles.FirstOrDefaultAsync(r => r.NormalizedName == Role.WellKnown.DeliveryPartner.ToUpperInvariant(), cancellationToken);
        if (role is null)
        {
            logger.LogWarning("DeliveryPartner role is not seeded — skipping demo delivery partner seeding.");
            return;
        }

        var demoPartners = new[]
        {
            ("partner1@ecommerce.local", "Ravi Kumar", "9840012345", "Bike"),
            ("partner2@ecommerce.local", "Suresh Babu", "9840012346", "Scooter"),
        };

        foreach (var (email, name, phone, vehicleType) in demoPartners)
        {
            var user = await identityDb.Users.FirstOrDefaultAsync(u => u.Email == email, cancellationToken);
            if (user is null)
            {
                var nameParts = name.Split(' ', 2);
                user = new User
                {
                    Email = email,
                    PasswordHash = passwordHasher.Hash("Admin@123"),
                    FirstName = nameParts[0],
                    LastName = nameParts.Length > 1 ? nameParts[1] : string.Empty,
                    PhoneNumber = phone,
                };
                user.UserRoles.Add(new UserRole { UserId = user.Id, RoleId = role.Id });
                identityDb.Users.Add(user);
                await identityDb.SaveChangesAsync(cancellationToken);
            }

            var partnerExists = await deliveryDb.DeliveryPartners.AnyAsync(p => p.UserId == user.Id, cancellationToken);
            if (!partnerExists)
            {
                deliveryDb.DeliveryPartners.Add(new DeliveryPartner
                {
                    UserId = user.Id,
                    Name = name,
                    PhoneNumber = phone,
                    VehicleType = vehicleType,
                    Status = DeliveryPartnerStatus.Available,
                });
            }
        }

        await deliveryDb.SaveChangesAsync(cancellationToken);
    }
}
