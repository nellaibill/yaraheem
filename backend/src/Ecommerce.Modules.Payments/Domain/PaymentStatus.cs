namespace Ecommerce.Modules.Payments.Domain;

public enum PaymentStatus
{
    Pending = 1,
    Authorized = 2,
    Paid = 3,
    Failed = 4,
    Refunded = 5,
    Cancelled = 6,
}
