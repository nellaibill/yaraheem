using Ecommerce.Modules.Audit.Contracts;
using Ecommerce.Modules.Audit.Domain;
using Ecommerce.Modules.Audit.Infrastructure;
using Ecommerce.Shared.Infrastructure.Security;
using Ecommerce.Shared.Kernel;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Modules.Audit.Application;

public sealed class AuditLogService(AuditDbContext db, ICurrentUser currentUser, IHttpContextAccessor httpContextAccessor) : IAuditLogService
{
    public Task LogAsync(string action, string? entityType, string? entityId, string? details, CancellationToken cancellationToken) =>
        InsertAsync(currentUser.UserId, currentUser.Email, action, entityType, entityId, details, cancellationToken);

    public Task LogForActorAsync(Guid actorUserId, string actorEmail, string action, string? entityType, string? entityId, string? details, CancellationToken cancellationToken) =>
        InsertAsync(actorUserId, actorEmail, action, entityType, entityId, details, cancellationToken);

    private async Task InsertAsync(Guid? actorUserId, string? actorEmail, string action, string? entityType, string? entityId, string? details, CancellationToken cancellationToken)
    {
        db.AuditLogEntries.Add(new AuditLogEntry
        {
            ActorUserId = actorUserId,
            ActorEmail = actorEmail,
            Action = action,
            EntityType = entityType,
            EntityId = entityId,
            Details = details,
            IpAddress = httpContextAccessor.HttpContext?.Connection.RemoteIpAddress?.ToString(),
        });

        await db.SaveChangesAsync(cancellationToken);
    }

    public async Task<PagedResult<AuditLogEntryDto>> SearchAsync(AuditLogQuery query, CancellationToken cancellationToken)
    {
        var entries = db.AuditLogEntries.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(query.Action))
        {
            entries = entries.Where(e => e.Action == query.Action);
        }

        if (!string.IsNullOrWhiteSpace(query.EntityType))
        {
            entries = entries.Where(e => e.EntityType == query.EntityType);
        }

        if (!string.IsNullOrWhiteSpace(query.ActorEmail))
        {
            var normalized = query.ActorEmail.Trim().ToLowerInvariant();
            entries = entries.Where(e => e.ActorEmail == normalized);
        }

        if (query.FromDate.HasValue)
        {
            entries = entries.Where(e => e.CreatedAt >= query.FromDate.Value);
        }

        if (query.ToDate.HasValue)
        {
            entries = entries.Where(e => e.CreatedAt <= query.ToDate.Value);
        }

        entries = entries.OrderByDescending(e => e.CreatedAt);

        var totalCount = await entries.CountAsync(cancellationToken);
        var page = query.Page <= 0 ? 1 : query.Page;
        var pageSize = query.PageSize <= 0 ? 50 : query.PageSize;

        var items = await entries.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync(cancellationToken);

        return new PagedResult<AuditLogEntryDto>
        {
            Items = items.Select(ToDto).ToList(),
            Page = page,
            PageSize = pageSize,
            TotalCount = totalCount,
        };
    }

    private static AuditLogEntryDto ToDto(AuditLogEntry e) =>
        new(e.Id, e.ActorUserId, e.ActorEmail, e.Action, e.EntityType, e.EntityId, e.Details, e.IpAddress, e.CreatedAt);
}
