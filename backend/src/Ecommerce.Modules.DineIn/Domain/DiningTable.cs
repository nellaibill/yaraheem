using Ecommerce.Shared.Kernel;

namespace Ecommerce.Modules.DineIn.Domain;

public class DiningTable : BaseEntity
{
    public required string Label { get; set; }
    public required int Capacity { get; set; }
    public DiningTableStatus Status { get; set; } = DiningTableStatus.Available;
}
