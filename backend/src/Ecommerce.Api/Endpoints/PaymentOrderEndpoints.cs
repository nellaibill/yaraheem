using System.Text.Json;
using Ecommerce.Modules.Orders.Application;
using Ecommerce.Modules.Orders.Domain;
using Ecommerce.Modules.Payments.Application;
using Ecommerce.Modules.Payments.Contracts;
using Ecommerce.Modules.Payments.Domain;
using Ecommerce.Shared.Kernel;
using Ecommerce.Shared.Kernel.Exceptions;
using Microsoft.AspNetCore.RateLimiting;

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

        group.MapPost("/razorpay/verify", async (
            RazorpayVerifyRequest request,
            ICurrentUser currentUser,
            IOrderService orderService,
            IPaymentTransactionService paymentTransactionService,
            IRazorpayGateway razorpayGateway,
            CancellationToken cancellationToken) =>
        {
            // Confirms the order belongs to the caller (or the caller is an admin) before
            // trusting anything else in the request.
            await orderService.GetByIdAsync(currentUser.UserId!.Value, currentUser.IsInRole("Admin"), request.OrderId, cancellationToken);

            if (!razorpayGateway.VerifyPaymentSignature(request.RazorpayOrderId, request.RazorpayPaymentId, request.RazorpaySignature))
            {
                throw new UnauthorizedAppException("Payment signature verification failed.");
            }

            await paymentTransactionService.UpdateStatusByReferenceAsync(
                request.RazorpayOrderId, PaymentStatus.Paid, $"Verified via Razorpay payment {request.RazorpayPaymentId}", cancellationToken);
            await orderService.MarkOrderConfirmedFromPaymentAsync(request.OrderId, cancellationToken);

            return Results.Ok(ApiResponse<object?>.SuccessResponse(null, "Payment verified."));
        }).WithSummary("Verify a Razorpay Checkout success callback and confirm the order.")
          .RequireAuthorization();

        group.MapPost("/razorpay/webhook", async (
            HttpContext httpContext,
            IOrderService orderService,
            IPaymentTransactionService paymentTransactionService,
            IRazorpayGateway razorpayGateway,
            ILogger<Program> logger,
            CancellationToken cancellationToken) =>
        {
            httpContext.Request.EnableBuffering();
            string rawBody;
            using (var reader = new StreamReader(httpContext.Request.Body, leaveOpen: true))
            {
                rawBody = await reader.ReadToEndAsync(cancellationToken);
            }
            httpContext.Request.Body.Position = 0;

            var signature = httpContext.Request.Headers["X-Razorpay-Signature"].ToString();
            if (!razorpayGateway.VerifyWebhookSignature(rawBody, signature))
            {
                logger.LogWarning("Razorpay webhook rejected: missing or invalid X-Razorpay-Signature.");
                return Results.Unauthorized();
            }

            // Server-to-server confirmation, independent of the frontend's /razorpay/verify
            // call — covers cases where the browser never returns after a successful payment
            // (closed tab, network drop). Verify the exact event payload shape against
            // Razorpay's current webhook docs when connecting real credentials; this reads
            // payload.payment.entity.{order_id,id}, which matches their documented
            // payment.captured event as of when this was written.
            try
            {
                using var document = JsonDocument.Parse(rawBody);
                var eventName = document.RootElement.GetProperty("event").GetString();
                if (eventName == "payment.captured")
                {
                    var paymentEntity = document.RootElement.GetProperty("payload").GetProperty("payment").GetProperty("entity");
                    var razorpayOrderId = paymentEntity.GetProperty("order_id").GetString()!;
                    var razorpayPaymentId = paymentEntity.GetProperty("id").GetString()!;

                    var transaction = await paymentTransactionService.UpdateStatusByReferenceAsync(
                        razorpayOrderId, PaymentStatus.Paid, $"Webhook: payment.captured ({razorpayPaymentId})", cancellationToken);

                    // The webhook payload doesn't carry our internal order id directly, but
                    // PaymentTransaction does (it's keyed by our OrderId, looked up by the
                    // Razorpay order id used as TransactionReference).
                    await orderService.MarkOrderConfirmedFromPaymentAsync(transaction.OrderId, cancellationToken);
                }
                else
                {
                    logger.LogInformation("Razorpay webhook received unhandled event {Event}", eventName);
                }
            }
            catch (NotFoundException)
            {
                logger.LogWarning("Razorpay webhook referenced an unknown transaction.");
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Razorpay webhook processing failed.");
            }

            return Results.Ok();
        }).WithSummary("Receive Razorpay's server-to-server payment.captured webhook.")
          .RequireRateLimiting("webhook");

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
