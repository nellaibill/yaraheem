using Ecommerce.Shared.Kernel;

namespace Ecommerce.Modules.DineIn.Domain;

/// <summary>One "fire to kitchen" event within a TableSession — a KOT round.</summary>
public class DineInRound : BaseEntity
{
    public required Guid TableSessionId { get; set; }
    public required int RoundNumber { get; set; }
    public DineInRoundStatus Status { get; set; } = DineInRoundStatus.Fired;
    public DateTimeOffset FiredAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset? ServedAt { get; set; }

    public ICollection<DineInRoundItem> Items { get; set; } = [];
}
