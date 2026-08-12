using System.Security.Cryptography;
using System.Text;
using Ecommerce.Modules.Payments.Application;
using Ecommerce.Modules.Payments.Contracts;
using Ecommerce.Modules.Payments.Domain;
using Ecommerce.Modules.Payments.Options;
using Ecommerce.Shared.Kernel;
using Ecommerce.Shared.Kernel.Exceptions;
using FluentValidation;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Ecommerce.Modules.Payments.Endpoints;

public static class PaymentEndpoints
{
    public static IEndpointRouteBuilder MapPaymentEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/payments").WithTags("Payments");

        group.MapPost("/webhook", async (
            HttpContext httpContext,
            PaymentWebhookRequest request,
            IValidator<PaymentWebhookRequest> validator,
            IPaymentTransactionService transactionService,
            IOptions<PaymentsOptions> paymentsOptions,
            ILogger<PaymentTransactionService> logger,
            CancellationToken cancellationToken) =>
        {
            await validator.ValidateAndThrowAsync(request, cancellationToken);

            if (!HasValidSignature(httpContext, request, paymentsOptions.Value.WebhookSecret))
            {
                logger.LogWarning(
                    "Payment webhook rejected: missing or invalid X-Webhook-Signature for transaction {TransactionReference}",
                    request.TransactionReference);
                return Results.Unauthorized();
            }

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
          .WithDescription(
              "Example: { \"transactionReference\": \"PAY-20260811-ABC123\", \"status\": \"Paid\", \"provider\": \"Dummy\" }. " +
              "Requires an X-Webhook-Signature header: Base64(HMAC-SHA256(Payments:WebhookSecret, \"{transactionReference}.{status}.{provider}\")).")
          .RequireRateLimiting("webhook");

        return app;
    }

    /// <summary>
    /// Verifies X-Webhook-Signature against an HMAC-SHA256 of the canonical payload
    /// "{transactionReference}.{status}.{provider}", keyed by the configured shared secret.
    /// Fails closed: no configured secret, no header, or a malformed/mismatched signature
    /// all reject the request rather than defaulting to "trusted."
    /// </summary>
    private static bool HasValidSignature(HttpContext httpContext, PaymentWebhookRequest request, string secret)
    {
        if (string.IsNullOrEmpty(secret))
        {
            return false;
        }

        var provided = httpContext.Request.Headers["X-Webhook-Signature"].ToString();
        if (string.IsNullOrEmpty(provided))
        {
            return false;
        }

        byte[] providedBytes;
        try
        {
            providedBytes = Convert.FromBase64String(provided);
        }
        catch (FormatException)
        {
            return false;
        }

        var payload = $"{request.TransactionReference}.{request.Status}.{request.Provider}";
        var expectedBytes = HMACSHA256.HashData(Encoding.UTF8.GetBytes(secret), Encoding.UTF8.GetBytes(payload));

        return providedBytes.Length == expectedBytes.Length && CryptographicOperations.FixedTimeEquals(expectedBytes, providedBytes);
    }
}
