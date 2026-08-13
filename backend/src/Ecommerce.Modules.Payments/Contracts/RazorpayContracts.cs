namespace Ecommerce.Modules.Payments.Contracts;

public sealed record RazorpayOrderDto(string RazorpayOrderId, string KeyId, long AmountInPaise, string Currency);

public sealed record RazorpayVerifyRequest(Guid OrderId, string RazorpayOrderId, string RazorpayPaymentId, string RazorpaySignature);
