using Ecommerce.Modules.Delivery.Domain;
using Ecommerce.Shared.Kernel.Exceptions;

namespace Ecommerce.Modules.Delivery.Application;

public sealed class DeliveryAssignmentTransitionService : IDeliveryAssignmentTransitionService
{
    private static readonly Dictionary<DeliveryAssignmentStatus, DeliveryAssignmentStatus[]> AllowedTransitions = new()
    {
        [DeliveryAssignmentStatus.Assigned] = [DeliveryAssignmentStatus.PickedUp],
        [DeliveryAssignmentStatus.PickedUp] = [DeliveryAssignmentStatus.OutForDelivery],
        [DeliveryAssignmentStatus.OutForDelivery] = [DeliveryAssignmentStatus.Delivered],
        [DeliveryAssignmentStatus.Delivered] = [],
    };

    public void EnsureValidTransition(DeliveryAssignmentStatus from, DeliveryAssignmentStatus to)
    {
        if (AllowedTransitions.TryGetValue(from, out var allowed) && allowed.Contains(to))
        {
            return;
        }

        throw new DomainValidationException(new Dictionary<string, string[]>
        {
            ["status"] = [$"Cannot transition delivery assignment from '{from}' to '{to}'."],
        });
    }
}
