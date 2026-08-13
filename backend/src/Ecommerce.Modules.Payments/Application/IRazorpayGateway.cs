using Ecommerce.Modules.Payments.Contracts;

namespace Ecommerce.Modules.Payments.Application;

public interface IRazorpayGateway
{
    /// <summary>False when Razorpay:KeyId/KeySecret aren't set (database override or config) — callers should fall back to the dummy simulator.</summary>
    Task<bool> IsConfiguredAsync(CancellationToken cancellationToken);

    Task<RazorpayOrderDto> CreateOrderAsync(Guid orderId, decimal amountInInr, CancellationToken cancellationToken);

    /// <summary>Per Razorpay's documented scheme: HMAC-SHA256("{razorpayOrderId}|{razorpayPaymentId}", KeySecret) == razorpaySignature.</summary>
    Task<bool> VerifyPaymentSignatureAsync(string razorpayOrderId, string razorpayPaymentId, string razorpaySignature, CancellationToken cancellationToken);

    /// <summary>Per Razorpay's documented scheme: HMAC-SHA256(rawRequestBody, WebhookSecret) == the X-Razorpay-Signature header.</summary>
    Task<bool> VerifyWebhookSignatureAsync(string rawBody, string signatureHeader, CancellationToken cancellationToken);
}
