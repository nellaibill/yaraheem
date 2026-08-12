using Ecommerce.Modules.Delivery.Domain;

namespace Ecommerce.Modules.Delivery.Contracts;

public sealed record DeliveryPartnerDto(
    Guid Id,
    string Name,
    string PhoneNumber,
    string VehicleType,
    DeliveryPartnerStatus Status,
    string Email);

public sealed record CreateDeliveryPartnerRequest(
    string Name,
    string PhoneNumber,
    string VehicleType,
    string Email,
    string Password);

public sealed record UpdateDeliveryPartnerRequest(
    string Name,
    string PhoneNumber,
    string VehicleType,
    DeliveryPartnerStatus Status);

public sealed record AssignDeliveryRequest(Guid DeliveryPartnerId);

public sealed record UpdateDeliveryStatusRequest(DeliveryAssignmentStatus Status);

public sealed record OrderAssignmentDto(
    Guid OrderId,
    Guid? DeliveryPartnerId,
    string? DeliveryPartnerName,
    DeliveryAssignmentStatus? Status,
    DateTimeOffset? AssignedAt);

public sealed record DeliveryOrderItemDto(string ProductName, int Quantity);

public sealed record MyDeliveryOrderDto(
    Guid OrderId,
    string OrderNumber,
    DeliveryAssignmentStatus Status,
    string CustomerName,
    string CustomerPhone,
    string AddressLine1,
    string? AddressLine2,
    string City,
    string State,
    string PostalCode,
    IReadOnlyList<DeliveryOrderItemDto> Items,
    decimal Total,
    DateTimeOffset AssignedAt);
