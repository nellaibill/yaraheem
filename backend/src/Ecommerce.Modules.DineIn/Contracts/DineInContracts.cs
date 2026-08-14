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

public sealed record CloseTableSessionRequest(string PaymentMethod);

public sealed record DineInRoundItemDto(Guid Id, Guid ProductId, string ProductName, int Quantity, decimal UnitPrice, decimal LineTotal);

public sealed record DineInRoundDto(
    Guid Id,
    int RoundNumber,
    DineInRoundStatus Status,
    DateTimeOffset FiredAt,
    List<DineInRoundItemDto> Items,
    decimal RoundTotal);

public sealed record DineInRoundPrintDto(string TableLabel, DineInRoundDto Round);

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
    decimal Total);
