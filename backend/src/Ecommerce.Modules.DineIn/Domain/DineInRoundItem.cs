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
}
