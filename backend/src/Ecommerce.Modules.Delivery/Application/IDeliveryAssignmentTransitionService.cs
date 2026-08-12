using Ecommerce.Modules.Delivery.Domain;

namespace Ecommerce.Modules.Delivery.Application;

public interface IDeliveryAssignmentTransitionService
{
    void EnsureValidTransition(DeliveryAssignmentStatus from, DeliveryAssignmentStatus to);
}
