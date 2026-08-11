using Ecommerce.Modules.Orders.Domain;
using Ecommerce.Shared.Kernel.Exceptions;

namespace Ecommerce.Modules.Orders.Application;

public sealed class OrderStatusTransitionService : IOrderStatusTransitionService
{
    private static readonly Dictionary<OrderStatus, OrderStatus[]> AllowedTransitions = new()
    {
        [OrderStatus.Pending] = [OrderStatus.Confirmed, OrderStatus.Cancelled],
        [OrderStatus.Confirmed] = [OrderStatus.Processing, OrderStatus.Cancelled],
        [OrderStatus.Processing] = [OrderStatus.Shipped, OrderStatus.Cancelled],
        [OrderStatus.Shipped] = [OrderStatus.Delivered],
        [OrderStatus.Delivered] = [],
        [OrderStatus.Cancelled] = [],
    };

    public void EnsureValidTransition(OrderStatus from, OrderStatus to)
    {
        if (AllowedTransitions.TryGetValue(from, out var allowed) && allowed.Contains(to))
        {
            return;
        }

        throw new DomainValidationException(new Dictionary<string, string[]>
        {
            ["status"] = [$"Cannot transition order from '{from}' to '{to}'."],
        });
    }
}
