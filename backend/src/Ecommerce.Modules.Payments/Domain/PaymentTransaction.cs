namespace Ecommerce.Modules.Payments.Domain;

public class PaymentTransaction
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid OrderId { get; set; }

    public string PaymentProvider { get; set; } = default!;
    public string PaymentMethod { get; set; } = default!;
    public string TransactionReference { get; set; } = default!;

    public decimal Amount { get; set; }
    public string Currency { get; set; } = "INR";

    public PaymentStatus Status { get; set; }

    public string? ProviderResponse { get; set; }
    public DateTimeOffset? PaidAt { get; set; }

    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
}
