using Ecommerce.Modules.Orders.Domain;

namespace Ecommerce.Modules.Orders.Contracts;

public sealed record ShippingAddressRequest(
    string FullName,
    string PhoneNumber,
    string AddressLine1,
    string? AddressLine2,
    string City,
    string State,
    string PostalCode,
    string Country);

public sealed record AddressDto(
    string FullName,
    string PhoneNumber,
    string AddressLine1,
    string? AddressLine2,
    string City,
    string State,
    string PostalCode,
    string Country);

public sealed record OrderItemDto(Guid Id, Guid ProductId, Guid? ProductVariantId, string ProductName, int Quantity, decimal UnitPrice, decimal LineTotal);

public sealed record OrderStatusHistoryDto(OrderStatus Status, string? Note, DateTimeOffset ChangedAt);

public sealed record OrderDto(
    Guid Id,
    string OrderNumber,
    Guid UserId,
    OrderStatus Status,
    decimal Subtotal,
    decimal Total,
    AddressDto ShippingAddress,
    IReadOnlyList<OrderItemDto> Items,
    IReadOnlyList<OrderStatusHistoryDto> StatusHistory,
    DateTimeOffset CreatedAt);

public sealed record CheckoutRequest(ShippingAddressRequest ShippingAddress);

public sealed record UpdateOrderStatusRequest(OrderStatus Status, string? Note);
