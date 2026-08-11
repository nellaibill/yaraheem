using Ecommerce.Modules.Payments.Contracts;
using Ecommerce.Modules.Payments.Domain;

namespace Ecommerce.Modules.Payments.Application;

public sealed class DummyPaymentService : IPaymentService
{
    private const string AlphanumericChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

    public Task<PaymentResult> ProcessPaymentAsync(
        Guid orderId,
        decimal amount,
        string paymentMethod,
        CancellationToken cancellationToken = default)
    {
        var reference = GenerateTransactionReference();

        var result = paymentMethod.Equals("ONLINE", StringComparison.OrdinalIgnoreCase)
            ? new PaymentResult(true, reference, PaymentStatus.Paid, "Payment processed successfully.")
            : new PaymentResult(true, reference, PaymentStatus.Pending, "Cash on delivery — payment collected on delivery.");

        return Task.FromResult(result);
    }

    private static string GenerateTransactionReference()
    {
        var datePart = DateTimeOffset.UtcNow.ToString("yyyyMMdd");
        var suffix = new string(Enumerable.Range(0, 6)
            .Select(_ => AlphanumericChars[Random.Shared.Next(AlphanumericChars.Length)])
            .ToArray());

        return $"PAY-{datePart}-{suffix}";
    }
}
