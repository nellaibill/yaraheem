using Ecommerce.Modules.Orders.Domain;

namespace Ecommerce.Modules.Orders.Application;

public interface IOrderStatusTransitionService
{
    void EnsureValidTransition(OrderStatus from, OrderStatus to);
}
