namespace Ecommerce.Modules.Audit.Contracts;

public sealed record AuditLogEntryDto(
    Guid Id,
    Guid? ActorUserId,
    string? ActorEmail,
    string Action,
    string? EntityType,
    string? EntityId,
    string? Details,
    string? IpAddress,
    DateTimeOffset CreatedAt);

public sealed record AuditLogQuery(
    string? Action,
    string? EntityType,
    string? ActorEmail,
    DateTimeOffset? FromDate,
    DateTimeOffset? ToDate,
    int Page = 1,
    int PageSize = 50);
