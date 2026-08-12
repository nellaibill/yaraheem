using Ecommerce.Modules.Orders.Domain;
using Ecommerce.Modules.Payments.Domain;

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

public sealed record OrderStatusHistoryDto(OrderStatus? PreviousStatus, OrderStatus NewStatus, string? Notes, DateTimeOffset ChangedAt);

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
    DateTimeOffset CreatedAt,
    string? PaymentMethod);

public sealed record CustomerSummaryDto(
    Guid Id,
    string Email,
    string FirstName,
    string LastName,
    string? PhoneNumber,
    DateTimeOffset CreatedAt,
    int OrderCount,
    decimal TotalSpent,
    DateTimeOffset? LastOrderAt);

public sealed record CheckoutRequest(string PaymentMethod, ShippingAddressRequest ShippingAddress);

public sealed record CheckoutResponse(Guid OrderId, string OrderNumber, PaymentStatus PaymentStatus, string TransactionReference);

public sealed record UpdateOrderStatusRequest(OrderStatus Status, string? Notes);

public sealed record AdminOrderQuery(
    OrderStatus? Status,
    string? OrderNumber,
    string? CustomerEmail,
    DateTimeOffset? FromDate,
    DateTimeOffset? ToDate,
    int Page = 1,
    int PageSize = 20);

public sealed record OrderTrackingEventDto(OrderStatus Status, DateTimeOffset Timestamp);

public sealed record OrderTrackingResponse(string OrderNumber, OrderStatus Status, DateTimeOffset UpdatedAt, IReadOnlyList<OrderTrackingEventDto> Timeline);
