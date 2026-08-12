using Ecommerce.Shared.Kernel;

namespace Ecommerce.Modules.Delivery.Domain;

public class DeliveryPartner : BaseEntity
{
    public required Guid UserId { get; set; }
    public required string Name { get; set; }
    public required string PhoneNumber { get; set; }
    public required string VehicleType { get; set; }
    public DeliveryPartnerStatus Status { get; set; } = DeliveryPartnerStatus.Offline;
}
