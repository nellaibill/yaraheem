using Ecommerce.Modules.Payments.Contracts;

namespace Ecommerce.Modules.Payments.Application;

public interface IPaymentService
{
    Task<PaymentResult> ProcessPaymentAsync(
        Guid orderId,
        decimal amount,
        string paymentMethod,
        CancellationToken cancellationToken = default);
}
