using Ecommerce.Shared.Kernel;

namespace Ecommerce.Modules.Orders.Domain;

public class OrderStatusHistory : BaseEntity
{
    public Guid OrderId { get; set; }
    public Order Order { get; set; } = null!;

    public OrderStatus? PreviousStatus { get; set; }
    public OrderStatus NewStatus { get; set; }
    public Guid? ChangedByUserId { get; set; }
    public string? Notes { get; set; }
    public DateTimeOffset ChangedAt { get; set; } = DateTimeOffset.UtcNow;
}
