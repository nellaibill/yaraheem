using Ecommerce.Shared.Kernel;

namespace Ecommerce.Modules.DineIn.Domain;

/// <summary>ProductName/UnitPrice are a snapshot at fire-time, same convention as Orders.OrderItem.</summary>
public class DineInRoundItem : BaseEntity
{
    public required Guid DineInRoundId { get; set; }
    public required Guid ProductId { get; set; }
    public required string ProductName { get; set; }
    public required int Quantity { get; set; }
    public required decimal UnitPrice { get; set; }

    // A comped item still shows on the bill (and was still cooked/served) but is excluded from
    // the subtotal — e.g. a wrong order the kitchen already made. LineTotal keeps showing what
    // it would have cost; IsComped drives the strikethrough/exclusion.
    public bool IsComped { get; set; }
    public string? CompReason { get; set; }
}
