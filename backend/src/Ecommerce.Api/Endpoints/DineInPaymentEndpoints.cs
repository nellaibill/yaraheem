using Ecommerce.Modules.DineIn.Application;
using Ecommerce.Modules.DineIn.Contracts;
using Ecommerce.Modules.Payments.Application;
using Ecommerce.Shared.Kernel;
using Ecommerce.Shared.Kernel.Exceptions;
using FluentValidation;

namespace Ecommerce.Api.Endpoints;

// Bridges the DineIn and Payments modules, which do not reference each other (same reasoning as
// PaymentOrderEndpoints for Orders+Payments). Lives in the composition root since it needs both
// modules' application services.
public static class DineInPaymentEndpoints
{
    public static IEndpointRouteBuilder MapDineInPaymentEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/staff/dinein/sessions").WithTags("DineIn").RequireAuthorization("DineInStaff");

        group.MapPost("/{sessionId:guid}/payments", async (
            Guid sessionId,
            CreateDineInPaymentRequest request,
            IValidator<CreateDineInPaymentRequest> validator,
            ITableSessionService service,
            IRazorpayGateway razorpayGateway,
            CancellationToken cancellationToken) =>
        {
            await validator.ValidateAndThrowAsync(request, cancellationToken);

            string? razorpayOrderId = null;
            string? razorpayKeyId = null;
            long? amountInPaise = null;

            if (request.Method == "Razorpay")
            {
                if (!await razorpayGateway.IsConfiguredAsync(cancellationToken))
                {
                    throw new ConflictException("Razorpay isn't configured on this server yet — use Cash, UPI, or Card instead.");
                }

                var razorpayOrder = await razorpayGateway.CreateOrderAsync(sessionId, request.Amount, cancellationToken);
                razorpayOrderId = razorpayOrder.RazorpayOrderId;
                razorpayKeyId = razorpayOrder.KeyId;
                amountInPaise = razorpayOrder.AmountInPaise;
            }

            var payment = await service.RecordPaymentAsync(sessionId, request.Label ?? "Full bill", request.Amount, request.Method, razorpayOrderId, cancellationToken);
            var response = new CreateDineInPaymentResponse(payment, razorpayKeyId, amountInPaise);
            return Results.Ok(ApiResponse<CreateDineInPaymentResponse>.SuccessResponse(response, "Payment recorded."));
        }).WithSummary("Record a payment toward this table's bill. Cash/UPI/Card mark paid immediately; Razorpay returns checkout details to complete on the tablet.");

        group.MapPost("/{sessionId:guid}/payments/{paymentId:guid}/verify", async (
            Guid sessionId,
            Guid paymentId,
            VerifyDineInPaymentRequest request,
            IValidator<VerifyDineInPaymentRequest> validator,
            ITableSessionService service,
            IRazorpayGateway razorpayGateway,
            CancellationToken cancellationToken) =>
        {
            await validator.ValidateAndThrowAsync(request, cancellationToken);

            var session = await service.GetSessionAsync(sessionId, cancellationToken);
            var payment = session.Payments.FirstOrDefault(p => p.Id == paymentId)
                          ?? throw new NotFoundException("DineInPayment", paymentId);

            if (string.IsNullOrEmpty(payment.RazorpayOrderId) ||
                !await razorpayGateway.VerifyPaymentSignatureAsync(payment.RazorpayOrderId, request.RazorpayPaymentId, request.RazorpaySignature, cancellationToken))
            {
                throw new UnauthorizedAppException("Payment signature verification failed.");
            }

            var updated = await service.MarkPaymentPaidAsync(sessionId, paymentId, request.RazorpayPaymentId, cancellationToken);
            return Results.Ok(ApiResponse<TableSessionDto>.SuccessResponse(updated, "Payment verified."));
        }).WithSummary("Verify a Razorpay Checkout success callback for a table payment and mark it paid.");

        return app;
    }
}
