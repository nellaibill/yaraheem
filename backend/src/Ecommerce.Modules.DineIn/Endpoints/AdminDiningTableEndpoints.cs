using Ecommerce.Modules.DineIn.Application;
using Ecommerce.Modules.DineIn.Contracts;
using Ecommerce.Shared.Kernel;
using FluentValidation;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace Ecommerce.Modules.DineIn.Endpoints;

public static class AdminDiningTableEndpoints
{
    public static IEndpointRouteBuilder MapAdminDiningTableEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/admin/dinein/tables").WithTags("Admin").RequireAuthorization("AdminOnly");

        group.MapGet("/", async (ITableSessionService service, CancellationToken cancellationToken) =>
            Results.Ok(ApiResponse<List<DiningTableDto>>.SuccessResponse(await service.GetTablesAsync(cancellationToken))))
            .WithSummary("List dining tables.");

        group.MapPost("/", async (
            CreateDiningTableRequest request,
            IValidator<CreateDiningTableRequest> validator,
            ITableSessionService service,
            CancellationToken cancellationToken) =>
        {
            await validator.ValidateAndThrowAsync(request, cancellationToken);
            var result = await service.CreateTableAsync(request, cancellationToken);
            return Results.Created($"/api/admin/dinein/tables/{result.Id}", ApiResponse<DiningTableDto>.SuccessResponse(result, "Table created."));
        }).WithSummary("Add a dining table to the floor.");

        group.MapPut("/{id:guid}", async (
            Guid id,
            UpdateDiningTableRequest request,
            IValidator<UpdateDiningTableRequest> validator,
            ITableSessionService service,
            CancellationToken cancellationToken) =>
        {
            await validator.ValidateAndThrowAsync(request, cancellationToken);
            var result = await service.UpdateTableAsync(id, request, cancellationToken);
            return Results.Ok(ApiResponse<DiningTableDto>.SuccessResponse(result, "Table updated."));
        }).WithSummary("Update a dining table's label, capacity, or status.");

        app.MapGet("/api/admin/dinein/sessions", async (ITableSessionService service, CancellationToken cancellationToken) =>
            Results.Ok(ApiResponse<List<TableSessionDto>>.SuccessResponse(await service.GetSessionsForAdminAsync(cancellationToken))))
            .WithTags("Admin")
            .RequireAuthorization("AdminOnly")
            .WithSummary("Every dine-in table session (most recent 200), for the admin's own dine-in revenue view — kept separate from GET /api/admin/orders (online/delivery) so the two never get summed together by mistake.");

        return app;
    }
}
