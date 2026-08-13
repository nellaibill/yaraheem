namespace Ecommerce.Shared.Infrastructure.Options;

public sealed class DeliveryPricingOptions
{
    public const string SectionName = "DeliveryPricing";

    public decimal FreeDeliveryThreshold { get; set; } = 799m;
    public decimal FlatDeliveryFee { get; set; } = 40m;
}
