using Ecommerce.Modules.Audit.Contracts;
using Ecommerce.Shared.Kernel;

namespace Ecommerce.Modules.Audit.Application;

public interface IAuditLogService
{
    /// <summary>
    /// Records one audit entry. Actor (user id/email) and IP are resolved automatically from
    /// the current HTTP request — callers only describe what happened.
    /// </summary>
    Task LogAsync(string action, string? entityType, string? entityId, string? details, CancellationToken cancellationToken);

    /// <summary>
    /// Same as <see cref="LogAsync"/> but with an explicit actor instead of resolving one from
    /// the current request's authenticated principal — for events like login where the request
    /// making the call is still anonymous at the point the event happens.
    /// </summary>
    Task LogForActorAsync(Guid actorUserId, string actorEmail, string action, string? entityType, string? entityId, string? details, CancellationToken cancellationToken);

    Task<PagedResult<AuditLogEntryDto>> SearchAsync(AuditLogQuery query, CancellationToken cancellationToken);
}
