using Ecommerce.Modules.DineIn.Application;
using Ecommerce.Modules.DineIn.Contracts;
using Ecommerce.Shared.Infrastructure.Security;
using Ecommerce.Shared.Kernel;
using FluentValidation;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace Ecommerce.Modules.DineIn.Endpoints;

/// <summary>Waiter-facing endpoints for running the floor: table grid, opening/closing tabs, firing rounds to the kitchen.</summary>
public static class DineInStaffEndpoints
{
    public static IEndpointRouteBuilder MapDineInStaffEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/staff/dinein").WithTags("DineIn").RequireAuthorization("DineInStaff");

        group.MapGet("/tables", async (ITableSessionService service, CancellationToken cancellationToken) =>
            Results.Ok(ApiResponse<List<DiningTableDto>>.SuccessResponse(await service.GetTablesAsync(cancellationToken))))
            .WithSummary("Table grid: every table's status and, if occupied, its running total.");

        group.MapPost("/tables/{tableId:guid}/sessions", async (
            Guid tableId,
            OpenTableSessionRequest request,
            IValidator<OpenTableSessionRequest> validator,
            ITableSessionService service,
            ICurrentUser currentUser,
            CancellationToken cancellationToken) =>
        {
            await validator.ValidateAndThrowAsync(request, cancellationToken);
            var result = await service.OpenSessionAsync(tableId, currentUser.UserId!.Value, request, cancellationToken);
            return Results.Created($"/api/staff/dinein/sessions/{result.Id}", ApiResponse<TableSessionDto>.SuccessResponse(result, "Table opened."));
        }).WithSummary("Seat guests at a table, opening a new tab.");

        group.MapGet("/sessions/{sessionId:guid}", async (
            Guid sessionId,
            ITableSessionService service,
            CancellationToken cancellationToken) =>
            Results.Ok(ApiResponse<TableSessionDto>.SuccessResponse(await service.GetSessionAsync(sessionId, cancellationToken))))
            .WithSummary("Full detail for one table's tab — every round fired so far and the running total.");

        group.MapPost("/sessions/{sessionId:guid}/rounds", async (
            Guid sessionId,
            FireRoundRequest request,
            IValidator<FireRoundRequest> validator,
            ITableSessionService service,
            CancellationToken cancellationToken) =>
        {
            await validator.ValidateAndThrowAsync(request, cancellationToken);
            var result = await service.FireRoundAsync(sessionId, request, cancellationToken);
            return Results.Ok(ApiResponse<TableSessionDto>.SuccessResponse(result, "Round fired to the kitchen."));
        }).WithSummary("Fire a new round of items to the kitchen for this table's tab.");

        group.MapPost("/sessions/{sessionId:guid}/request-bill", async (
            Guid sessionId,
            ITableSessionService service,
            CancellationToken cancellationToken) =>
            Results.Ok(ApiResponse<TableSessionDto>.SuccessResponse(await service.RequestBillAsync(sessionId, cancellationToken), "Bill requested.")))
            .WithSummary("Lock the tab from further rounds — guests are ready to pay.");

        group.MapGet("/rounds/{roundId:guid}", async (
            Guid roundId,
            ITableSessionService service,
            CancellationToken cancellationToken) =>
            Results.Ok(ApiResponse<DineInRoundPrintDto>.SuccessResponse(await service.GetRoundForPrintAsync(roundId, cancellationToken))))
            .WithSummary("One round's details for printing its KOT.");

        group.MapPost("/sessions/{sessionId:guid}/close", async (
            Guid sessionId,
            CloseTableSessionRequest request,
            IValidator<CloseTableSessionRequest> validator,
            ITableSessionService service,
            CancellationToken cancellationToken) =>
        {
            await validator.ValidateAndThrowAsync(request, cancellationToken);
            var result = await service.CloseSessionAsync(sessionId, request, cancellationToken);
            return Results.Ok(ApiResponse<TableSessionDto>.SuccessResponse(result, "Table closed out."));
        }).WithSummary("Record payment and close the tab — the table becomes available again after cleaning.");

        return app;
    }
}
