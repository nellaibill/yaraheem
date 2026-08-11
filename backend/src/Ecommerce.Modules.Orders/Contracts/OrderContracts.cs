using Ecommerce.Modules.Orders.Domain;

namespace Ecommerce.Modules.Orders.Contracts;

public sealed record ShippingAddressRequest(
    string FullName,
    string Line1,
    string? Line2,
    string City,
    string State,
    string PostalCode,
    string Country,
    string? Phone);

public sealed record AddressDto(string FullName, string Line1, string? Line2, string City, string State, string PostalCode, string Country, string? Phone);

public sealed record OrderItemDto(Guid Id, Guid ProductId, Guid? ProductVariantId, string ProductName, int Quantity, decimal UnitPrice, decimal LineTotal);

public sealed record OrderStatusHistoryDto(OrderStatus Status, string? Note, DateTimeOffset ChangedAt);

public sealed record OrderDto(
    Guid Id,
    Guid UserId,
    OrderStatus Status,
    decimal Subtotal,
    decimal Total,
    AddressDto ShippingAddress,
    IReadOnlyList<OrderItemDto> Items,
    IReadOnlyList<OrderStatusHistoryDto> StatusHistory,
    DateTimeOffset CreatedAt);

public sealed record CreateOrderRequest(ShippingAddressRequest ShippingAddress);

public sealed record UpdateOrderStatusRequest(OrderStatus Status, string? Note);
