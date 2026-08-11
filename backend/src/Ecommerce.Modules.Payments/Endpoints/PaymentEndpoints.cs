using Ecommerce.Modules.Payments.Application;
using Ecommerce.Modules.Payments.Contracts;
using Ecommerce.Modules.Payments.Domain;
using Ecommerce.Shared.Kernel;
using Ecommerce.Shared.Kernel.Exceptions;
using FluentValidation;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.Logging;

namespace Ecommerce.Modules.Payments.Endpoints;

public static class PaymentEndpoints
{
    public static IEndpointRouteBuilder MapPaymentEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/payments").WithTags("Payments");

        group.MapPost("/webhook", async (
            PaymentWebhookRequest request,
            IValidator<PaymentWebhookRequest> validator,
            IPaymentTransactionService transactionService,
            ILogger<PaymentTransactionService> logger,
            CancellationToken cancellationToken) =>
        {
            await validator.ValidateAndThrowAsync(request, cancellationToken);

            logger.LogInformation("Payment webhook received: {@Payload}", request);

            try
            {
                var status = Enum.Parse<PaymentStatus>(request.Status, true);
                await transactionService.UpdateStatusByReferenceAsync(
                    request.TransactionReference, status, $"Webhook from {request.Provider}", cancellationToken);
            }
            catch (NotFoundException)
            {
                logger.LogWarning("Webhook referenced unknown transaction {TransactionReference}", request.TransactionReference);
            }

            return Results.Ok(ApiResponse<object?>.SuccessResponse(null, "Webhook processed."));
        }).WithSummary("Receive a payment provider webhook notification.")
          .WithDescription("Example: { \"transactionReference\": \"PAY-20260811-ABC123\", \"status\": \"Paid\", \"provider\": \"Dummy\" }");

        return app;
    }
}
