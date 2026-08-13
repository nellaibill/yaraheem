using Ecommerce.Shared.Kernel;

namespace Ecommerce.Modules.Audit.Domain;

/// <summary>
/// One row per security/business-sensitive mutation (admin status changes, menu edits,
/// delivery partner changes, admin logins). Append-only — nothing in this module ever
/// updates or deletes an existing entry.
/// </summary>
public class AuditLogEntry : BaseEntity
{
    public Guid? ActorUserId { get; set; }
    public string? ActorEmail { get; set; }
    public required string Action { get; set; }
    public string? EntityType { get; set; }
    public string? EntityId { get; set; }
    public string? Details { get; set; }
    public string? IpAddress { get; set; }
}
