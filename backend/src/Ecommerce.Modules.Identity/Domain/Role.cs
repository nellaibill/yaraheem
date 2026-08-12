using Ecommerce.Shared.Kernel;

namespace Ecommerce.Modules.Identity.Domain;

public class Role : BaseEntity
{
    public required string Name { get; set; }
    public required string NormalizedName { get; set; }

    public ICollection<UserRole> UserRoles { get; set; } = [];

    public static class WellKnown
    {
        public const string Admin = "Admin";
        public const string Customer = "Customer";
        public const string DeliveryPartner = "DeliveryPartner";
    }
}
