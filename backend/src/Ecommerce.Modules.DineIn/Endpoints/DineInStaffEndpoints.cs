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

        group.MapPost("/tables/{tableId:guid}/mark-clean", async (
            Guid tableId,
            ITableSessionService service,
            CancellationToken cancellationToken) =>
            Results.Ok(ApiResponse<DiningTableDto>.SuccessResponse(await service.MarkTableCleanedAsync(tableId, cancellationToken), "Table is available again.")))
            .WithSummary("Bussed and reset — bring a table back into rotation after Needs Cleaning.");

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

        group.MapPost("/sessions/{sessionId:guid}/discount", async (
            Guid sessionId,
            ApplySessionDiscountRequest request,
            IValidator<ApplySessionDiscountRequest> validator,
            ITableSessionService service,
            CancellationToken cancellationToken) =>
        {
            await validator.ValidateAndThrowAsync(request, cancellationToken);
            var result = await service.ApplySessionDiscountAsync(sessionId, request.Amount, request.Reason, cancellationToken);
            return Results.Ok(ApiResponse<TableSessionDto>.SuccessResponse(result, "Discount applied."));
        }).WithSummary("Apply (or update) a manual discount on the whole bill, with a required reason.");

        group.MapPost("/sessions/{sessionId:guid}/discount/remove", async (
            Guid sessionId,
            ITableSessionService service,
            CancellationToken cancellationToken) =>
            Results.Ok(ApiResponse<TableSessionDto>.SuccessResponse(await service.RemoveSessionDiscountAsync(sessionId, cancellationToken), "Discount removed.")))
            .WithSummary("Remove the manual discount from this bill.");

        group.MapPost("/sessions/{sessionId:guid}/rounds/{roundId:guid}/items/{itemId:guid}/comp", async (
            Guid sessionId,
            Guid roundId,
            Guid itemId,
            CompRoundItemRequest request,
            IValidator<CompRoundItemRequest> validator,
            ITableSessionService service,
            CancellationToken cancellationToken) =>
        {
            await validator.ValidateAndThrowAsync(request, cancellationToken);
            var result = await service.CompRoundItemAsync(sessionId, roundId, itemId, request.Reason, cancellationToken);
            return Results.Ok(ApiResponse<TableSessionDto>.SuccessResponse(result, "Item comped."));
        }).WithSummary("Comp a single item — still shown on the bill, excluded from the charge — with a required reason.");

        group.MapPost("/sessions/{sessionId:guid}/rounds/{roundId:guid}/items/{itemId:guid}/uncomp", async (
            Guid sessionId,
            Guid roundId,
            Guid itemId,
            ITableSessionService service,
            CancellationToken cancellationToken) =>
            Results.Ok(ApiResponse<TableSessionDto>.SuccessResponse(await service.UncompRoundItemAsync(sessionId, roundId, itemId, cancellationToken), "Comp removed.")))
            .WithSummary("Undo a comp on a single item, restoring it to the charge.");

        group.MapPost("/sessions/{sessionId:guid}/rounds/{roundId:guid}/cancel", async (
            Guid sessionId,
            Guid roundId,
            ITableSessionService service,
            CancellationToken cancellationToken) =>
            Results.Ok(ApiResponse<TableSessionDto>.SuccessResponse(await service.CancelRoundAsync(sessionId, roundId, cancellationToken), "Round cancelled — stock restored.")))
            .WithSummary("Cancel a round that hasn't been started by the kitchen yet, restoring the deducted stock.");

        group.MapPost("/sessions/{sessionId:guid}/rounds/{roundId:guid}/serve", async (
            Guid sessionId,
            Guid roundId,
            ITableSessionService service,
            CancellationToken cancellationToken) =>
            Results.Ok(ApiResponse<TableSessionDto>.SuccessResponse(await service.MarkRoundServedAsync(sessionId, roundId, cancellationToken), "Round marked as served.")))
            .WithSummary("Mark a Ready round as served once it's actually been delivered to the table.");

        group.MapGet("/rounds/{roundId:guid}", async (
            Guid roundId,
            ITableSessionService service,
            CancellationToken cancellationToken) =>
            Results.Ok(ApiResponse<DineInRoundPrintDto>.SuccessResponse(await service.GetRoundForPrintAsync(roundId, cancellationToken))))
            .WithSummary("One round's details for printing its KOT.");

        group.MapPost("/sessions/{sessionId:guid}/close", async (
            Guid sessionId,
            ITableSessionService service,
            CancellationToken cancellationToken) =>
            Results.Ok(ApiResponse<TableSessionDto>.SuccessResponse(await service.CloseSessionAsync(sessionId, cancellationToken), "Table closed out.")))
            .WithSummary("Close the tab once fully paid — the table becomes available again after cleaning.");

        return app;
    }
}
