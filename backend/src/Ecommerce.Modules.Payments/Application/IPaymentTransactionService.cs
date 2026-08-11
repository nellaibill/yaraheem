using Ecommerce.Modules.Payments.Contracts;
using Ecommerce.Modules.Payments.Domain;

namespace Ecommerce.Modules.Payments.Application;

public interface IPaymentTransactionService
{
    Task<PaymentTransactionDto> CreateAsync(
        Guid orderId,
        string provider,
        string method,
        decimal amount,
        string currency,
        PaymentStatus status,
        string transactionReference,
        string? providerResponse,
        CancellationToken cancellationToken);

    Task<PaymentTransactionDto?> GetByOrderIdAsync(Guid orderId, CancellationToken cancellationToken);

    Task<PaymentTransactionDto> UpdateStatusByReferenceAsync(
        string transactionReference,
        PaymentStatus status,
        string? providerResponse,
        CancellationToken cancellationToken);
}
