namespace Ecommerce.Shared.Infrastructure.Pricing;

public interface IDeliveryFeeCalculator
{
    /// <summary>
    /// Backend-authoritative delivery fee for a given items subtotal. The frontend never
    /// decides this value — it only ever displays what this returns, so a tampered client
    /// request can't change what gets charged.
    /// </summary>
    decimal Calculate(decimal subtotal);
}
