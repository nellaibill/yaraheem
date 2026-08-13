using Ecommerce.Modules.Payments.Contracts;

namespace Ecommerce.Modules.Payments.Application;

public interface IRazorpayGateway
{
    /// <summary>False when Razorpay:KeyId/KeySecret aren't set — callers should fall back to the dummy simulator.</summary>
    bool IsConfigured { get; }

    Task<RazorpayOrderDto> CreateOrderAsync(Guid orderId, decimal amountInInr, CancellationToken cancellationToken);

    /// <summary>Per Razorpay's documented scheme: HMAC-SHA256("{razorpayOrderId}|{razorpayPaymentId}", KeySecret) == razorpaySignature.</summary>
    bool VerifyPaymentSignature(string razorpayOrderId, string razorpayPaymentId, string razorpaySignature);

    /// <summary>Per Razorpay's documented scheme: HMAC-SHA256(rawRequestBody, WebhookSecret) == the X-Razorpay-Signature header.</summary>
    bool VerifyWebhookSignature(string rawBody, string signatureHeader);
}
