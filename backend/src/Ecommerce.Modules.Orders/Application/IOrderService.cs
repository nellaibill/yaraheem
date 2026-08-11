using Ecommerce.Modules.Orders.Contracts;
using Ecommerce.Shared.Kernel;

namespace Ecommerce.Modules.Orders.Application;

public interface IOrderService
{
    Task<CheckoutResponse> CheckoutAsync(Guid userId, CheckoutRequest request, CancellationToken cancellationToken);
    Task<OrderDto> GetByIdAsync(Guid userId, bool isAdmin, Guid orderId, CancellationToken cancellationToken);
    Task<PagedResult<OrderDto>> GetMyOrdersAsync(Guid userId, int page, int pageSize, CancellationToken cancellationToken);
    Task<OrderDto> UpdateStatusAsync(Guid orderId, UpdateOrderStatusRequest request, Guid? changedByUserId, CancellationToken cancellationToken);
    Task<PagedResult<OrderDto>> GetAdminOrdersAsync(AdminOrderQuery query, CancellationToken cancellationToken);
    Task<OrderTrackingResponse> GetTrackingAsync(Guid userId, bool isAdmin, Guid orderId, CancellationToken cancellationToken);
    Task MarkOrderConfirmedFromPaymentAsync(Guid orderId, CancellationToken cancellationToken);
}
