using Ecommerce.Modules.Payments.Contracts;
using Ecommerce.Modules.Payments.Domain;
using Ecommerce.Modules.Payments.Infrastructure;
using Ecommerce.Shared.Kernel.Exceptions;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Modules.Payments.Application;

public sealed class PaymentTransactionService(PaymentsDbContext db) : IPaymentTransactionService
{
    public async Task<PaymentTransactionDto> CreateAsync(
        Guid orderId,
        string provider,
        string method,
        decimal amount,
        string currency,
        PaymentStatus status,
        string transactionReference,
        string? providerResponse,
        CancellationToken cancellationToken)
    {
        var now = DateTimeOffset.UtcNow;

        var transaction = new PaymentTransaction
        {
            OrderId = orderId,
            PaymentProvider = provider,
            PaymentMethod = method,
            TransactionReference = transactionReference,
            Amount = amount,
            Currency = currency,
            Status = status,
            ProviderResponse = providerResponse,
            PaidAt = status == PaymentStatus.Paid ? now : null,
            CreatedAt = now,
            UpdatedAt = now,
        };

        db.PaymentTransactions.Add(transaction);
        await db.SaveChangesAsync(cancellationToken);

        return ToDto(transaction);
    }

    public async Task<PaymentTransactionDto?> GetByOrderIdAsync(Guid orderId, CancellationToken cancellationToken)
    {
        var transaction = await db.PaymentTransactions.AsNoTracking()
            .Where(t => t.OrderId == orderId)
            .OrderByDescending(t => t.CreatedAt)
            .FirstOrDefaultAsync(cancellationToken);

        return transaction is null ? null : ToDto(transaction);
    }

    public async Task<PaymentTransactionDto> UpdateStatusByReferenceAsync(
        string transactionReference,
        PaymentStatus status,
        string? providerResponse,
        CancellationToken cancellationToken)
    {
        var transaction = await db.PaymentTransactions
            .FirstOrDefaultAsync(t => t.TransactionReference == transactionReference, cancellationToken)
            ?? throw new NotFoundException("PaymentTransaction", transactionReference);

        transaction.Status = status;
        transaction.ProviderResponse = providerResponse ?? transaction.ProviderResponse;
        transaction.UpdatedAt = DateTimeOffset.UtcNow;
        if (status == PaymentStatus.Paid && transaction.PaidAt is null)
        {
            transaction.PaidAt = DateTimeOffset.UtcNow;
        }

        await db.SaveChangesAsync(cancellationToken);

        return ToDto(transaction);
    }

    private static PaymentTransactionDto ToDto(PaymentTransaction t) =>
        new(t.OrderId, t.PaymentMethod, t.TransactionReference, t.Amount, t.Currency, t.Status, t.PaidAt);
}
