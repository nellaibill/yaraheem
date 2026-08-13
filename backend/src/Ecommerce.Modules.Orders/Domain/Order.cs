using Ecommerce.Shared.Kernel;

namespace Ecommerce.Modules.Orders.Domain;

public class Order : BaseEntity
{
    public Guid UserId { get; set; }
    public required string OrderNumber { get; set; }
    public OrderStatus Status { get; set; } = OrderStatus.Pending;
    public decimal Subtotal { get; set; }
    public decimal DeliveryFee { get; set; }
    public decimal DiscountAmount { get; set; }
    public decimal Total { get; set; }
    public string? IdempotencyKey { get; set; }
    public string? CouponCode { get; set; }

    public Address ShippingAddress { get; set; } = null!;
    public ICollection<OrderItem> Items { get; set; } = [];
    public ICollection<OrderStatusHistory> StatusHistory { get; set; } = [];
}
