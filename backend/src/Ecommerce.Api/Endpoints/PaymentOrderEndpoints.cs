using Ecommerce.Modules.Orders.Application;
using Ecommerce.Modules.Orders.Domain;
using Ecommerce.Modules.Payments.Application;
using Ecommerce.Modules.Payments.Contracts;
using Ecommerce.Modules.Payments.Domain;
using Ecommerce.Shared.Kernel;
using Ecommerce.Shared.Kernel.Exceptions;

namespace Ecommerce.Api.Endpoints;

// Bridges the Orders and Payments modules, which do not reference each other.
// Lives in the composition root since it needs both modules' application services.
public static class PaymentOrderEndpoints
{
    public static IEndpointRouteBuilder MapPaymentOrderEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/payments/orders").WithTags("Payments").RequireAuthorization();

        group.MapPost("/{orderId:guid}/pay", async (
            Guid orderId,
            PayOrderRequest? request,
            ICurrentUser currentUser,
            IOrderService orderService,
            IPaymentService paymentService,
            IPaymentTransactionService paymentTransactionService,
            CancellationToken cancellationToken) =>
        {
            var order = await orderService.GetByIdAsync(currentUser.UserId!.Value, currentUser.IsInRole("Admin"), orderId, cancellationToken);

            if (order.Status != OrderStatus.Pending)
            {
                throw new ConflictException("Payment can only be processed for pending orders.");
            }

            var existing = await paymentTransactionService.GetByOrderIdAsync(orderId, cancellationToken);
            if (existing?.Status == PaymentStatus.Paid)
            {
                throw new ConflictException("This order has already been paid.");
            }

            var paymentMethod = request?.PaymentMethod ?? existing?.PaymentMethod ?? "ONLINE";
            var result = await paymentService.ProcessPaymentAsync(orderId, order.Total, paymentMethod, cancellationToken);

            var dto = existing is null
                ? await paymentTransactionService.CreateAsync(orderId, "Dummy", paymentMethod, order.Total, "INR", result.Status, result.TransactionReference, result.Message, cancellationToken)
                : await paymentTransactionService.UpdateStatusByReferenceAsync(existing.TransactionReference, result.Status, result.Message, cancellationToken);

            if (result.Status == PaymentStatus.Paid)
            {
                await orderService.MarkOrderConfirmedFromPaymentAsync(orderId, cancellationToken);
            }

            return Results.Ok(ApiResponse<PaymentTransactionDto>.SuccessResponse(dto, "Payment processed."));
        }).WithSummary("Process payment for an existing pending order.");

        group.MapGet("/{orderId:guid}", async (
            Guid orderId,
            ICurrentUser currentUser,
            IOrderService orderService,
            IPaymentTransactionService paymentTransactionService,
            CancellationToken cancellationToken) =>
        {
            await orderService.GetByIdAsync(currentUser.UserId!.Value, currentUser.IsInRole("Admin"), orderId, cancellationToken);

            var dto = await paymentTransactionService.GetByOrderIdAsync(orderId, cancellationToken)
                      ?? throw new NotFoundException("PaymentTransaction", orderId);

            return Results.Ok(ApiResponse<PaymentTransactionDto>.SuccessResponse(dto));
        });

        return app;
    }
}

public sealed record PayOrderRequest(string? PaymentMethod);
