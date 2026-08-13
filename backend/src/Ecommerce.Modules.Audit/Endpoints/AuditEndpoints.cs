using Ecommerce.Modules.Audit.Application;
using Ecommerce.Modules.Audit.Contracts;
using Ecommerce.Shared.Kernel;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace Ecommerce.Modules.Audit.Endpoints;

public static class AuditEndpoints
{
    public static IEndpointRouteBuilder MapAdminAuditEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/admin/audit-logs").WithTags("Audit").RequireAuthorization("AdminOnly");

        group.MapGet("/", async (
            string? action,
            string? entityType,
            string? actorEmail,
            DateTimeOffset? fromDate,
            DateTimeOffset? toDate,
            int page,
            int pageSize,
            IAuditLogService service,
            CancellationToken cancellationToken) =>
        {
            var query = new AuditLogQuery(action, entityType, actorEmail, fromDate, toDate, page <= 0 ? 1 : page, pageSize <= 0 ? 50 : pageSize);
            var result = await service.SearchAsync(query, cancellationToken);
            return Results.Ok(ApiResponse<PagedResult<AuditLogEntryDto>>.SuccessResponse(result));
        }).WithSummary("List audit log entries, most recent first. Filterable by action, entity type, actor email, and date range.");

        return app;
    }
}
