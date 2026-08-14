using Ecommerce.Shared.Kernel;

namespace Ecommerce.Modules.DineIn.Domain;

/// <summary>
/// One seating at a table, from the waiter opening it until the bill is paid and closed.
/// Accumulates any number of <see cref="DineInRound"/>s before a single final payment —
/// unlike Orders.Order, which is one cart -> one checkout -> one payment. CreatedAt (from
/// BaseEntity) is the opened-at time.
/// </summary>
public class TableSession : BaseEntity
{
    public required Guid TableId { get; set; }
    public required Guid OpenedByUserId { get; set; }
    public required int GuestCount { get; set; }
    public TableSessionStatus Status { get; set; } = TableSessionStatus.Open;
    public string? PaymentMethod { get; set; }
    public decimal? TotalAmount { get; set; }
    public DateTimeOffset? ClosedAt { get; set; }

    public ICollection<DineInRound> Rounds { get; set; } = [];
}
