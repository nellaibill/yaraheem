using Ecommerce.Modules.DineIn.Domain;

namespace Ecommerce.Modules.DineIn.Contracts;

public sealed record DiningTableDto(
    Guid Id,
    string Label,
    int Capacity,
    DiningTableStatus Status,
    Guid? ActiveSessionId,
    decimal? RunningTotal);

public sealed record CreateDiningTableRequest(string Label, int Capacity);

public sealed record UpdateDiningTableRequest(string Label, int Capacity, DiningTableStatus Status);

public sealed record OpenTableSessionRequest(int GuestCount);

public sealed record FireRoundItemRequest(Guid ProductId, int Quantity);

public sealed record FireRoundRequest(List<FireRoundItemRequest> Items);

public sealed record DineInRoundItemDto(
    Guid Id,
    Guid ProductId,
    string ProductName,
    int Quantity,
    decimal UnitPrice,
    decimal LineTotal,
    bool IsComped,
    string? CompReason);

public sealed record CompRoundItemRequest(string Reason);

public sealed record ApplySessionDiscountRequest(decimal Amount, string Reason);

public sealed record DineInRoundDto(
    Guid Id,
    int RoundNumber,
    DineInRoundStatus Status,
    DateTimeOffset FiredAt,
    List<DineInRoundItemDto> Items,
    decimal RoundTotal);

public sealed record DineInRoundPrintDto(string TableLabel, DineInRoundDto Round);

public sealed record DineInPaymentDto(
    Guid Id,
    Guid TableSessionId,
    string Label,
    decimal Amount,
    string Method,
    DineInPaymentStatus Status,
    string? RazorpayOrderId,
    DateTimeOffset? PaidAt);

public sealed record CreateDineInPaymentRequest(decimal Amount, string Method, string? Label);

public sealed record CreateDineInPaymentResponse(DineInPaymentDto Payment, string? RazorpayKeyId, long? RazorpayAmountInPaise);

public sealed record VerifyDineInPaymentRequest(string RazorpayPaymentId, string RazorpaySignature);

public sealed record KitchenRoundDto(
    Guid Id,
    Guid SessionId,
    string TableLabel,
    int RoundNumber,
    DineInRoundStatus Status,
    DateTimeOffset FiredAt,
    List<DineInRoundItemDto> Items);

public sealed record TableSessionDto(
    Guid Id,
    Guid TableId,
    string TableLabel,
    Guid OpenedByUserId,
    int GuestCount,
    TableSessionStatus Status,
    DateTimeOffset OpenedAt,
    DateTimeOffset? ClosedAt,
    string? PaymentMethod,
    List<DineInRoundDto> Rounds,
    List<DineInPaymentDto> Payments,
    decimal Subtotal,
    decimal DiscountAmount,
    string? DiscountReason,
    decimal TaxRatePercent,
    decimal TaxAmount,
    decimal ServiceChargePercent,
    decimal ServiceChargeAmount,
    decimal Total);
