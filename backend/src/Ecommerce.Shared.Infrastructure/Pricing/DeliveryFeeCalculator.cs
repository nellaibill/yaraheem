using Ecommerce.Shared.Infrastructure.Options;
using Microsoft.Extensions.Options;

namespace Ecommerce.Shared.Infrastructure.Pricing;

public sealed class DeliveryFeeCalculator(IOptions<DeliveryPricingOptions> options) : IDeliveryFeeCalculator
{
    public decimal Calculate(decimal subtotal)
    {
        if (subtotal <= 0)
        {
            return 0m;
        }

        var pricing = options.Value;
        return subtotal >= pricing.FreeDeliveryThreshold ? 0m : pricing.FlatDeliveryFee;
    }
}
