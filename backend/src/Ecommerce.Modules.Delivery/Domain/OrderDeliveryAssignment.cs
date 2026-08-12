using Ecommerce.Shared.Kernel;

namespace Ecommerce.Modules.Delivery.Domain;

public class OrderDeliveryAssignment : BaseEntity
{
    public required Guid OrderId { get; set; }
    public required Guid DeliveryPartnerId { get; set; }
    public DeliveryAssignmentStatus Status { get; set; } = DeliveryAssignmentStatus.Assigned;
    public DateTimeOffset AssignedAt { get; set; } = DateTimeOffset.UtcNow;
}
