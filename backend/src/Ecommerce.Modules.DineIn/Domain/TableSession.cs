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

    // Null while the session is still Open/BillRequested — the bill is computed live from
    // current items and the current DineInBillingOptions rates. Frozen at CloseSessionAsync so a
    // closed bill still shows what was actually charged even if the rates change afterward.
    public decimal? Subtotal { get; set; }
    public decimal? TaxAmount { get; set; }
    public decimal? ServiceChargeAmount { get; set; }
    public decimal? TotalAmount { get; set; }
    public DateTimeOffset? ClosedAt { get; set; }

    // Manual, staff-applied discount on the whole bill (e.g. a VIP discount) — separate from
    // per-item comps below. Applied before tax/service charge. Stays in place until removed or
    // the session closes, at which point it's naturally frozen since nothing else can edit it.
    public decimal? DiscountAmount { get; set; }
    public string? DiscountReason { get; set; }

    public ICollection<DineInRound> Rounds { get; set; } = [];
    public ICollection<DineInPayment> Payments { get; set; } = [];
}
