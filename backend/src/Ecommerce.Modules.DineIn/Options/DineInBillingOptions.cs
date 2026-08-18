namespace Ecommerce.Modules.DineIn.Options;

/// <summary>Configurable rates applied on top of the item subtotal when computing a table's bill.</summary>
public sealed class DineInBillingOptions
{
    public const string SectionName = "DineInBilling";

    public decimal TaxRatePercent { get; set; } = 5m;
    public decimal ServiceChargePercent { get; set; }
}
