using Ecommerce.Modules.Audit.Application;
using Ecommerce.Modules.Catalog.Infrastructure;
using Ecommerce.Modules.DineIn.Contracts;
using Ecommerce.Modules.DineIn.Domain;
using Ecommerce.Modules.DineIn.Infrastructure;
using Ecommerce.Modules.Inventory.Application;
using Ecommerce.Modules.Inventory.Contracts;
using Ecommerce.Modules.Inventory.Domain;
using Ecommerce.Shared.Kernel.Exceptions;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Modules.DineIn.Application;

public sealed class TableSessionService(
    DineInDbContext db,
    CatalogDbContext catalogDb,
    IInventoryService inventoryService,
    IAuditLogService auditLog) : ITableSessionService
{
    public async Task<List<DiningTableDto>> GetTablesAsync(CancellationToken cancellationToken)
    {
        var tables = await db.DiningTables.AsNoTracking().OrderBy(t => t.Label).ToListAsync(cancellationToken);

        var activeSessions = await db.TableSessions.AsNoTracking()
            .Where(s => s.Status != TableSessionStatus.Closed)
            .Include(s => s.Rounds).ThenInclude(r => r.Items)
            .ToListAsync(cancellationToken);
        var activeByTable = activeSessions.ToDictionary(s => s.TableId);

        return tables.Select(t =>
        {
            activeByTable.TryGetValue(t.Id, out var session);
            var runningTotal = session is null ? (decimal?)null : ComputeSessionTotal(session);
            return new DiningTableDto(t.Id, t.Label, t.Capacity, t.Status, session?.Id, runningTotal);
        }).ToList();
    }

    public async Task<DiningTableDto> CreateTableAsync(CreateDiningTableRequest request, CancellationToken cancellationToken)
    {
        var table = new DiningTable { Label = request.Label.Trim(), Capacity = request.Capacity };
        db.DiningTables.Add(table);
        await db.SaveChangesAsync(cancellationToken);
        await auditLog.LogAsync("DiningTable.Created", "DiningTable", table.Id.ToString(), table.Label, cancellationToken);
        return new DiningTableDto(table.Id, table.Label, table.Capacity, table.Status, null, null);
    }

    public async Task<DiningTableDto> UpdateTableAsync(Guid tableId, UpdateDiningTableRequest request, CancellationToken cancellationToken)
    {
        var table = await db.DiningTables.FirstOrDefaultAsync(t => t.Id == tableId, cancellationToken)
                    ?? throw new NotFoundException("DiningTable", tableId);

        table.Label = request.Label.Trim();
        table.Capacity = request.Capacity;
        table.Status = request.Status;
        await db.SaveChangesAsync(cancellationToken);
        await auditLog.LogAsync("DiningTable.Updated", "DiningTable", table.Id.ToString(), table.Label, cancellationToken);

        return new DiningTableDto(table.Id, table.Label, table.Capacity, table.Status, null, null);
    }

    public async Task<DiningTableDto> MarkTableCleanedAsync(Guid tableId, CancellationToken cancellationToken)
    {
        var table = await db.DiningTables.FirstOrDefaultAsync(t => t.Id == tableId, cancellationToken)
                    ?? throw new NotFoundException("DiningTable", tableId);

        if (table.Status != DiningTableStatus.NeedsCleaning)
        {
            throw new ConflictException($"Table '{table.Label}' is not awaiting cleaning (currently {table.Status}).");
        }

        table.Status = DiningTableStatus.Available;
        await db.SaveChangesAsync(cancellationToken);
        await auditLog.LogAsync("DiningTable.Cleaned", "DiningTable", table.Id.ToString(), table.Label, cancellationToken);

        return new DiningTableDto(table.Id, table.Label, table.Capacity, table.Status, null, null);
    }

    public async Task<TableSessionDto> OpenSessionAsync(Guid tableId, Guid waiterUserId, OpenTableSessionRequest request, CancellationToken cancellationToken)
    {
        var table = await db.DiningTables.FirstOrDefaultAsync(t => t.Id == tableId, cancellationToken)
                    ?? throw new NotFoundException("DiningTable", tableId);

        if (table.Status != DiningTableStatus.Available)
        {
            throw new ConflictException($"Table '{table.Label}' is not available (currently {table.Status}).");
        }

        var session = new TableSession
        {
            TableId = tableId,
            OpenedByUserId = waiterUserId,
            GuestCount = request.GuestCount,
        };
        db.TableSessions.Add(session);
        table.Status = DiningTableStatus.Occupied;

        await db.SaveChangesAsync(cancellationToken);
        await auditLog.LogAsync("TableSession.Opened", "TableSession", session.Id.ToString(), $"Table {table.Label}, {request.GuestCount} guests", cancellationToken);

        return await BuildSessionDtoAsync(session.Id, cancellationToken);
    }

    public async Task<TableSessionDto> GetSessionAsync(Guid sessionId, CancellationToken cancellationToken) =>
        await BuildSessionDtoAsync(sessionId, cancellationToken);

    public async Task<TableSessionDto> FireRoundAsync(Guid sessionId, FireRoundRequest request, CancellationToken cancellationToken)
    {
        if (request.Items.Count == 0)
        {
            throw new ConflictException("A round needs at least one item.");
        }

        var session = await db.TableSessions.FirstOrDefaultAsync(s => s.Id == sessionId, cancellationToken)
                      ?? throw new NotFoundException("TableSession", sessionId);

        if (session.Status != TableSessionStatus.Open)
        {
            throw new ConflictException("This table's bill has already been requested — cannot fire another round.");
        }

        var productIds = request.Items.Select(i => i.ProductId).Distinct().ToList();
        var products = await catalogDb.Products.AsNoTracking()
            .Where(p => productIds.Contains(p.Id) && p.IsActive)
            .ToDictionaryAsync(p => p.Id, cancellationToken);

        var missing = productIds.Where(id => !products.ContainsKey(id)).ToList();
        if (missing.Count > 0)
        {
            throw new NotFoundException("Product", string.Join(", ", missing));
        }

        var nextRoundNumber = await db.DineInRounds.CountAsync(r => r.TableSessionId == sessionId, cancellationToken) + 1;
        var round = new DineInRound { TableSessionId = sessionId, RoundNumber = nextRoundNumber };

        foreach (var item in request.Items)
        {
            var product = products[item.ProductId];
            round.Items.Add(new DineInRoundItem
            {
                DineInRoundId = round.Id,
                ProductId = product.Id,
                ProductName = product.Name,
                Quantity = item.Quantity,
                UnitPrice = product.Price,
            });
        }

        // Deducted per round, not at final bill — the kitchen is already cooking, unlike a
        // delivery order where stock is deducted once at checkout.
        var quantities = request.Items
            .GroupBy(i => i.ProductId)
            .ToDictionary(g => g.Key, g => g.Sum(i => i.Quantity));
        await inventoryService.ValidateAndDeductForSaleAsync(quantities, $"DineIn-{sessionId}-R{nextRoundNumber}", cancellationToken);

        db.DineInRounds.Add(round);
        await db.SaveChangesAsync(cancellationToken);
        await auditLog.LogAsync("DineInRound.Fired", "TableSession", sessionId.ToString(), $"Round {nextRoundNumber}, {request.Items.Count} item line(s)", cancellationToken);

        return await BuildSessionDtoAsync(sessionId, cancellationToken);
    }

    public async Task<TableSessionDto> RequestBillAsync(Guid sessionId, CancellationToken cancellationToken)
    {
        var session = await db.TableSessions.FirstOrDefaultAsync(s => s.Id == sessionId, cancellationToken)
                      ?? throw new NotFoundException("TableSession", sessionId);

        if (session.Status != TableSessionStatus.Open)
        {
            throw new ConflictException($"Session is already {session.Status}.");
        }

        session.Status = TableSessionStatus.BillRequested;
        await db.SaveChangesAsync(cancellationToken);
        await auditLog.LogAsync("TableSession.BillRequested", "TableSession", sessionId.ToString(), null, cancellationToken);

        return await BuildSessionDtoAsync(sessionId, cancellationToken);
    }

    public async Task<TableSessionDto> CloseSessionAsync(Guid sessionId, CloseTableSessionRequest request, CancellationToken cancellationToken)
    {
        var session = await db.TableSessions
            .Include(s => s.Rounds).ThenInclude(r => r.Items)
            .FirstOrDefaultAsync(s => s.Id == sessionId, cancellationToken)
            ?? throw new NotFoundException("TableSession", sessionId);

        if (session.Status == TableSessionStatus.Closed)
        {
            throw new ConflictException("This session is already closed.");
        }

        var table = await db.DiningTables.FirstAsync(t => t.Id == session.TableId, cancellationToken);

        session.Status = TableSessionStatus.Closed;
        session.PaymentMethod = request.PaymentMethod;
        session.TotalAmount = ComputeSessionTotal(session);
        session.ClosedAt = DateTimeOffset.UtcNow;
        table.Status = DiningTableStatus.NeedsCleaning;

        await db.SaveChangesAsync(cancellationToken);
        await auditLog.LogAsync("TableSession.Closed", "TableSession", sessionId.ToString(), $"{request.PaymentMethod}, total {session.TotalAmount:C}", cancellationToken);

        return await BuildSessionDtoAsync(sessionId, cancellationToken);
    }

    public async Task<DineInRoundPrintDto> GetRoundForPrintAsync(Guid roundId, CancellationToken cancellationToken)
    {
        var round = await db.DineInRounds.AsNoTracking()
            .Include(r => r.Items)
            .FirstOrDefaultAsync(r => r.Id == roundId, cancellationToken)
            ?? throw new NotFoundException("DineInRound", roundId);

        var session = await db.TableSessions.AsNoTracking().FirstAsync(s => s.Id == round.TableSessionId, cancellationToken);
        var table = await db.DiningTables.AsNoTracking().FirstAsync(t => t.Id == session.TableId, cancellationToken);

        var itemDtos = round.Items.Select(i => new DineInRoundItemDto(i.Id, i.ProductId, i.ProductName, i.Quantity, i.UnitPrice, i.UnitPrice * i.Quantity)).ToList();
        var roundDto = new DineInRoundDto(round.Id, round.RoundNumber, round.Status, round.FiredAt, itemDtos, itemDtos.Sum(i => i.LineTotal));

        return new DineInRoundPrintDto(table.Label, roundDto);
    }

    private async Task<TableSessionDto> BuildSessionDtoAsync(Guid sessionId, CancellationToken cancellationToken)
    {
        var session = await db.TableSessions.AsNoTracking()
            .Include(s => s.Rounds).ThenInclude(r => r.Items)
            .FirstOrDefaultAsync(s => s.Id == sessionId, cancellationToken)
            ?? throw new NotFoundException("TableSession", sessionId);

        var table = await db.DiningTables.AsNoTracking().FirstAsync(t => t.Id == session.TableId, cancellationToken);

        var roundDtos = session.Rounds.OrderBy(r => r.RoundNumber).Select(r =>
        {
            var itemDtos = r.Items.Select(i => new DineInRoundItemDto(i.Id, i.ProductId, i.ProductName, i.Quantity, i.UnitPrice, i.UnitPrice * i.Quantity)).ToList();
            return new DineInRoundDto(r.Id, r.RoundNumber, r.Status, r.FiredAt, itemDtos, itemDtos.Sum(i => i.LineTotal));
        }).ToList();

        return new TableSessionDto(
            session.Id,
            session.TableId,
            table.Label,
            session.OpenedByUserId,
            session.GuestCount,
            session.Status,
            session.CreatedAt,
            session.ClosedAt,
            session.PaymentMethod,
            roundDtos,
            session.TotalAmount ?? ComputeSessionTotal(session));
    }

    public async Task<TableSessionDto> CancelRoundAsync(Guid sessionId, Guid roundId, CancellationToken cancellationToken)
    {
        var session = await db.TableSessions.FirstOrDefaultAsync(s => s.Id == sessionId, cancellationToken)
                      ?? throw new NotFoundException("TableSession", sessionId);

        if (session.Status != TableSessionStatus.Open)
        {
            throw new ConflictException("This table's bill has already been requested — cannot cancel a round now.");
        }

        var round = await db.DineInRounds.Include(r => r.Items)
            .FirstOrDefaultAsync(r => r.Id == roundId && r.TableSessionId == sessionId, cancellationToken)
            ?? throw new NotFoundException("DineInRound", roundId);

        if (round.Status != DineInRoundStatus.Fired)
        {
            throw new ConflictException($"Round {round.RoundNumber} is already {round.Status} — the kitchen has already started on it, it can't be cancelled from here.");
        }

        // Reverse the deduction made when the round was fired — same mechanism an admin uses
        // for any other stock correction, just triggered automatically instead of by hand.
        foreach (var item in round.Items)
        {
            await inventoryService.AdjustAsync(
                new AdjustInventoryRequest(item.ProductId, item.Quantity, InventoryTransactionType.Adjustment, $"DineIn-Cancel-{sessionId}-R{round.RoundNumber}"),
                cancellationToken);
        }

        round.Status = DineInRoundStatus.Cancelled;
        await db.SaveChangesAsync(cancellationToken);
        await auditLog.LogAsync("DineInRound.Cancelled", "TableSession", sessionId.ToString(), $"Round {round.RoundNumber} cancelled, stock reversed", cancellationToken);

        return await BuildSessionDtoAsync(sessionId, cancellationToken);
    }

    public async Task<List<TableSessionDto>> GetSessionsForAdminAsync(CancellationToken cancellationToken)
    {
        var sessionIds = await db.TableSessions.AsNoTracking()
            .OrderByDescending(s => s.CreatedAt)
            .Take(200)
            .Select(s => s.Id)
            .ToListAsync(cancellationToken);

        var result = new List<TableSessionDto>(sessionIds.Count);
        foreach (var id in sessionIds)
        {
            result.Add(await BuildSessionDtoAsync(id, cancellationToken));
        }
        return result;
    }

    private static decimal ComputeSessionTotal(TableSession session) =>
        session.Rounds.Where(r => r.Status != DineInRoundStatus.Cancelled).SelectMany(r => r.Items).Sum(i => i.UnitPrice * i.Quantity);

    public async Task<List<KitchenRoundDto>> GetKitchenQueueAsync(CancellationToken cancellationToken)
    {
        var activeStatuses = new[] { DineInRoundStatus.Fired, DineInRoundStatus.Preparing, DineInRoundStatus.Ready };
        var rounds = await db.DineInRounds.AsNoTracking()
            .Include(r => r.Items)
            .Where(r => activeStatuses.Contains(r.Status))
            .OrderBy(r => r.FiredAt)
            .ToListAsync(cancellationToken);

        if (rounds.Count == 0) return [];

        var sessionIds = rounds.Select(r => r.TableSessionId).Distinct().ToList();
        var sessions = await db.TableSessions.AsNoTracking()
            .Where(s => sessionIds.Contains(s.Id))
            .ToDictionaryAsync(s => s.Id, cancellationToken);

        var tableIds = sessions.Values.Select(s => s.TableId).Distinct().ToList();
        var tables = await db.DiningTables.AsNoTracking()
            .Where(t => tableIds.Contains(t.Id))
            .ToDictionaryAsync(t => t.Id, cancellationToken);

        return rounds.Select(r =>
        {
            var session = sessions[r.TableSessionId];
            var table = tables[session.TableId];
            return ToKitchenDto(r, session.Id, table.Label);
        }).ToList();
    }

    public async Task<KitchenRoundDto> AdvanceRoundStatusAsync(Guid roundId, CancellationToken cancellationToken)
    {
        var round = await db.DineInRounds.Include(r => r.Items)
            .FirstOrDefaultAsync(r => r.Id == roundId, cancellationToken)
            ?? throw new NotFoundException("DineInRound", roundId);

        var next = round.Status switch
        {
            DineInRoundStatus.Fired => DineInRoundStatus.Preparing,
            DineInRoundStatus.Preparing => DineInRoundStatus.Ready,
            DineInRoundStatus.Ready => DineInRoundStatus.Served,
            _ => throw new ConflictException($"Round {round.RoundNumber} is {round.Status} and can't be advanced further."),
        };

        round.Status = next;
        if (next == DineInRoundStatus.Served) round.ServedAt = DateTimeOffset.UtcNow;
        await db.SaveChangesAsync(cancellationToken);
        await auditLog.LogAsync("DineInRound.StatusAdvanced", "TableSession", round.TableSessionId.ToString(), $"Round {round.RoundNumber} -> {next}", cancellationToken);

        var session = await db.TableSessions.AsNoTracking().FirstAsync(s => s.Id == round.TableSessionId, cancellationToken);
        var table = await db.DiningTables.AsNoTracking().FirstAsync(t => t.Id == session.TableId, cancellationToken);

        return ToKitchenDto(round, session.Id, table.Label);
    }

    private static KitchenRoundDto ToKitchenDto(DineInRound round, Guid sessionId, string tableLabel)
    {
        var itemDtos = round.Items.Select(i => new DineInRoundItemDto(i.Id, i.ProductId, i.ProductName, i.Quantity, i.UnitPrice, i.UnitPrice * i.Quantity)).ToList();
        return new KitchenRoundDto(round.Id, sessionId, tableLabel, round.RoundNumber, round.Status, round.FiredAt, itemDtos);
    }
}
