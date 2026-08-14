using Ecommerce.Shared.Kernel;

namespace Ecommerce.Modules.DineIn.Domain;

/// <summary>
/// One payment toward a TableSession's bill. Cash/UPI/Card are recorded as Paid immediately —
/// the money already changed hands physically. Razorpay stays Pending until the signature is
/// verified. A session can carry more than one of these (split billing): it closes once the
/// Paid rows sum to the session total.
/// </summary>
public class DineInPayment : BaseEntity
{
    public required Guid TableSessionId { get; set; }
    public required string Label { get; set; }
    public required decimal Amount { get; set; }
    public required string Method { get; set; }
    public DineInPaymentStatus Status { get; set; } = DineInPaymentStatus.Pending;
    public string? RazorpayOrderId { get; set; }
    public string? RazorpayPaymentId { get; set; }
    public DateTimeOffset? PaidAt { get; set; }
}
