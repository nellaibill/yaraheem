using Ecommerce.Modules.Payments.Contracts;
using Ecommerce.Modules.Payments.Domain;

namespace Ecommerce.Modules.Payments.Application;

/// <summary>
/// The real IPaymentService used by checkout. COD is handled exactly like the dummy simulator
/// (payment is collected on delivery, not through this gateway at all). ONLINE payments create
/// a real Razorpay order when Razorpay:KeyId/KeySecret are configured — the returned
/// TransactionReference is the Razorpay order id, PaymentStatus stays Pending until the
/// frontend's Razorpay Checkout flow completes and POSTs to /api/payments/orders/razorpay/verify
/// (or Razorpay's webhook fires). Without real credentials, ONLINE falls back to the dummy
/// simulator's instant-Paid behavior so checkout keeps working end-to-end in dev/pilot.
/// </summary>
public sealed class RazorpayPaymentService(IRazorpayGateway razorpayGateway, DummyPaymentService fallback) : IPaymentService
{
    public async Task<PaymentResult> ProcessPaymentAsync(Guid orderId, decimal amount, string paymentMethod, CancellationToken cancellationToken = default)
    {
        if (!paymentMethod.Equals("ONLINE", StringComparison.OrdinalIgnoreCase) || !razorpayGateway.IsConfigured)
        {
            return await fallback.ProcessPaymentAsync(orderId, amount, paymentMethod, cancellationToken);
        }

        var razorpayOrder = await razorpayGateway.CreateOrderAsync(orderId, amount, cancellationToken);

        return new PaymentResult(
            IsSuccess: true,
            TransactionReference: razorpayOrder.RazorpayOrderId,
            Status: PaymentStatus.Pending,
            Message: "Awaiting payment confirmation via Razorpay.",
            GatewayKeyId: razorpayOrder.KeyId);
    }
}
