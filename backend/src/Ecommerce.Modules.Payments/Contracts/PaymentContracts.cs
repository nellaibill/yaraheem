using Ecommerce.Modules.Payments.Domain;

namespace Ecommerce.Modules.Payments.Contracts;

public sealed record PaymentResult(bool IsSuccess, string TransactionReference, PaymentStatus Status, string Message);

public sealed record PaymentTransactionDto(
    Guid OrderId,
    string PaymentMethod,
    string TransactionReference,
    decimal Amount,
    string Currency,
    PaymentStatus Status,
    DateTimeOffset? PaidAt);

public sealed record PaymentWebhookRequest(string TransactionReference, string Status, string Provider);
