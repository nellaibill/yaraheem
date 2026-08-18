using Ecommerce.Modules.Audit.Application;
using Ecommerce.Modules.Catalog.Infrastructure;
using Ecommerce.Modules.DineIn.Contracts;
using Ecommerce.Modules.DineIn.Domain;
using Ecommerce.Modules.DineIn.Infrastructure;
using Ecommerce.Modules.DineIn.Options;
using Ecommerce.Modules.Inventory.Application;
using Ecommerce.Modules.Inventory.Contracts;
using Ecommerce.Modules.Inventory.Domain;
using Ecommerce.Shared.Kernel.Exceptions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace Ecommerce.Modules.DineIn.Application;

public sealed class TableSessionService(
    DineInDbContext db,
    CatalogDbContext catalogDb,
    IInventoryService inventoryService,
    IAuditLogService auditLog,
    IOptions<DineInBillingOptions> billingOptions) : ITableSessionService
{
    private sealed record BillBreakdown(decimal Subtotal, decimal DiscountAmount, decimal TaxAmount, decimal ServiceChargeAmount, decimal Total);

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
            var runningTotal = session is null ? (decimal?)null : ComputeBillBreakdown(session).Total;
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

    public async Task<TableSessionDto> ApplySessionDiscountAsync(Guid sessionId, decimal amount, string reason, CancellationToken cancellationToken)
    {
        var session = await db.TableSessions
            .Include(s => s.Rounds).ThenInclude(r => r.Items)
            .FirstOrDefaultAsync(s => s.Id == sessionId, cancellationToken)
            ?? throw new NotFoundException("TableSession", sessionId);

        if (session.Status == TableSessionStatus.Closed)
        {
            throw new ConflictException("This session is already closed — a discount can't be applied now.");
        }

        var subtotal = session.Rounds.Where(r => r.Status != DineInRoundStatus.Cancelled)
            .SelectMany(r => r.Items)
            .Where(i => !i.IsComped)
            .Sum(i => i.UnitPrice * i.Quantity);

        if (amount > subtotal)
        {
            throw new ConflictException($"Discount of {amount:C} exceeds the bill's subtotal of {subtotal:C}.");
        }

        session.DiscountAmount = amount;
        session.DiscountReason = reason.Trim();
        await db.SaveChangesAsync(cancellationToken);
        await auditLog.LogAsync("TableSession.DiscountApplied", "TableSession", sessionId.ToString(), $"{amount:C} — {session.DiscountReason}", cancellationToken);

        return await BuildSessionDtoAsync(sessionId, cancellationToken);
    }

    public async Task<TableSessionDto> RemoveSessionDiscountAsync(Guid sessionId, CancellationToken cancellationToken)
    {
        var session = await db.TableSessions.FirstOrDefaultAsync(s => s.Id == sessionId, cancellationToken)
                      ?? throw new NotFoundException("TableSession", sessionId);

        if (session.Status == TableSessionStatus.Closed)
        {
            throw new ConflictException("This session is already closed — the discount can't be changed now.");
        }

        session.DiscountAmount = null;
        session.DiscountReason = null;
        await db.SaveChangesAsync(cancellationToken);
        await auditLog.LogAsync("TableSession.DiscountRemoved", "TableSession", sessionId.ToString(), null, cancellationToken);

        return await BuildSessionDtoAsync(sessionId, cancellationToken);
    }

    public async Task<TableSessionDto> CloseSessionAsync(Guid sessionId, CancellationToken cancellationToken)
    {
        var session = await db.TableSessions
            .Include(s => s.Rounds).ThenInclude(r => r.Items)
            .Include(s => s.Payments)
            .FirstOrDefaultAsync(s => s.Id == sessionId, cancellationToken)
            ?? throw new NotFoundException("TableSession", sessionId);

        if (session.Status == TableSessionStatus.Closed)
        {
            throw new ConflictException("This session is already closed.");
        }

        var breakdown = ComputeBillBreakdown(session);
        var amountPaid = session.Payments.Where(p => p.Status == DineInPaymentStatus.Paid).Sum(p => p.Amount);
        if (amountPaid < breakdown.Total)
        {
            throw new ConflictException($"Only {amountPaid:C} of {breakdown.Total:C} has been collected — record the remaining payment before closing.");
        }

        var table = await db.DiningTables.FirstAsync(t => t.Id == session.TableId, cancellationToken);
        var paymentMethodSummary = string.Join(" + ", session.Payments.Where(p => p.Status == DineInPaymentStatus.Paid).Select(p => p.Method).Distinct());

        session.Status = TableSessionStatus.Closed;
        session.PaymentMethod = paymentMethodSummary;
        session.Subtotal = breakdown.Subtotal;
        session.TaxAmount = breakdown.TaxAmount;
        session.ServiceChargeAmount = breakdown.ServiceChargeAmount;
        session.TotalAmount = breakdown.Total;
        session.ClosedAt = DateTimeOffset.UtcNow;
        table.Status = DiningTableStatus.NeedsCleaning;

        await db.SaveChangesAsync(cancellationToken);
        await auditLog.LogAsync("TableSession.Closed", "TableSession", sessionId.ToString(), $"{paymentMethodSummary}, total {session.TotalAmount:C}", cancellationToken);

        return await BuildSessionDtoAsync(sessionId, cancellationToken);
    }

    public async Task<DineInPaymentDto> RecordPaymentAsync(Guid sessionId, string label, decimal amount, string method, string? razorpayOrderId, CancellationToken cancellationToken)
    {
        var session = await db.TableSessions.FirstOrDefaultAsync(s => s.Id == sessionId, cancellationToken)
                      ?? throw new NotFoundException("TableSession", sessionId);

        if (session.Status != TableSessionStatus.BillRequested)
        {
            throw new ConflictException("Payments can only be recorded once the bill has been requested.");
        }

        var payment = new DineInPayment
        {
            TableSessionId = sessionId,
            Label = label,
            Amount = amount,
            Method = method,
            RazorpayOrderId = razorpayOrderId,
        };

        if (razorpayOrderId is null)
        {
            payment.Status = DineInPaymentStatus.Paid;
            payment.PaidAt = DateTimeOffset.UtcNow;
        }

        db.DineInPayments.Add(payment);
        await db.SaveChangesAsync(cancellationToken);
        await auditLog.LogAsync("DineInPayment.Recorded", "TableSession", sessionId.ToString(), $"{payment.Label}: {payment.Method} {payment.Amount:C} ({payment.Status})", cancellationToken);

        return ToPaymentDto(payment);
    }

    public async Task<TableSessionDto> MarkPaymentPaidAsync(Guid sessionId, Guid paymentId, string? razorpayPaymentId, CancellationToken cancellationToken)
    {
        var payment = await db.DineInPayments.FirstOrDefaultAsync(p => p.Id == paymentId && p.TableSessionId == sessionId, cancellationToken)
                      ?? throw new NotFoundException("DineInPayment", paymentId);

        if (payment.Status != DineInPaymentStatus.Paid)
        {
            payment.Status = DineInPaymentStatus.Paid;
            payment.RazorpayPaymentId = razorpayPaymentId;
            payment.PaidAt = DateTimeOffset.UtcNow;
            await db.SaveChangesAsync(cancellationToken);
            await auditLog.LogAsync("DineInPayment.Verified", "TableSession", sessionId.ToString(), $"{payment.Label}: {payment.Amount:C}", cancellationToken);
        }

        return await BuildSessionDtoAsync(sessionId, cancellationToken);
    }

    private static DineInPaymentDto ToPaymentDto(DineInPayment p) =>
        new(p.Id, p.TableSessionId, p.Label, p.Amount, p.Method, p.Status, p.RazorpayOrderId, p.PaidAt);

    public async Task<DineInRoundPrintDto> GetRoundForPrintAsync(Guid roundId, CancellationToken cancellationToken)
    {
        var round = await db.DineInRounds.AsNoTracking()
            .Include(r => r.Items)
            .FirstOrDefaultAsync(r => r.Id == roundId, cancellationToken)
            ?? throw new NotFoundException("DineInRound", roundId);

        var session = await db.TableSessions.AsNoTracking().FirstAsync(s => s.Id == round.TableSessionId, cancellationToken);
        var table = await db.DiningTables.AsNoTracking().FirstAsync(t => t.Id == session.TableId, cancellationToken);

        var itemDtos = round.Items.Select(ToItemDto).ToList();
        var roundDto = new DineInRoundDto(round.Id, round.RoundNumber, round.Status, round.FiredAt, itemDtos, itemDtos.Where(i => !i.IsComped).Sum(i => i.LineTotal));

        return new DineInRoundPrintDto(table.Label, roundDto);
    }

    private async Task<TableSessionDto> BuildSessionDtoAsync(Guid sessionId, CancellationToken cancellationToken)
    {
        var session = await db.TableSessions.AsNoTracking()
            .Include(s => s.Rounds).ThenInclude(r => r.Items)
            .Include(s => s.Payments)
            .FirstOrDefaultAsync(s => s.Id == sessionId, cancellationToken)
            ?? throw new NotFoundException("TableSession", sessionId);

        var table = await db.DiningTables.AsNoTracking().FirstAsync(t => t.Id == session.TableId, cancellationToken);

        var roundDtos = session.Rounds.OrderBy(r => r.RoundNumber).Select(r =>
        {
            var itemDtos = r.Items.Select(ToItemDto).ToList();
            return new DineInRoundDto(r.Id, r.RoundNumber, r.Status, r.FiredAt, itemDtos, itemDtos.Where(i => !i.IsComped).Sum(i => i.LineTotal));
        }).ToList();

        var paymentDtos = session.Payments.OrderBy(p => p.CreatedAt).Select(ToPaymentDto).ToList();

        var breakdown = session.TotalAmount is null
            ? ComputeBillBreakdown(session)
            : new BillBreakdown(session.Subtotal ?? 0m, session.DiscountAmount ?? 0m, session.TaxAmount ?? 0m, session.ServiceChargeAmount ?? 0m, session.TotalAmount.Value);
        var rates = billingOptions.Value;

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
            paymentDtos,
            breakdown.Subtotal,
            breakdown.DiscountAmount,
            session.DiscountReason,
            rates.TaxRatePercent,
            breakdown.TaxAmount,
            rates.ServiceChargePercent,
            breakdown.ServiceChargeAmount,
            breakdown.Total);
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

    public async Task<TableSessionDto> CompRoundItemAsync(Guid sessionId, Guid roundId, Guid itemId, string reason, CancellationToken cancellationToken)
    {
        var item = await FindRoundItemAsync(sessionId, roundId, itemId, cancellationToken);

        item.IsComped = true;
        item.CompReason = reason.Trim();
        await db.SaveChangesAsync(cancellationToken);
        await auditLog.LogAsync("DineInRoundItem.Comped", "TableSession", sessionId.ToString(), $"{item.ProductName} — {item.CompReason}", cancellationToken);

        return await BuildSessionDtoAsync(sessionId, cancellationToken);
    }

    public async Task<TableSessionDto> UncompRoundItemAsync(Guid sessionId, Guid roundId, Guid itemId, CancellationToken cancellationToken)
    {
        var item = await FindRoundItemAsync(sessionId, roundId, itemId, cancellationToken);

        item.IsComped = false;
        item.CompReason = null;
        await db.SaveChangesAsync(cancellationToken);
        await auditLog.LogAsync("DineInRoundItem.Uncomped", "TableSession", sessionId.ToString(), item.ProductName, cancellationToken);

        return await BuildSessionDtoAsync(sessionId, cancellationToken);
    }

    private async Task<DineInRoundItem> FindRoundItemAsync(Guid sessionId, Guid roundId, Guid itemId, CancellationToken cancellationToken)
    {
        var session = await db.TableSessions.FirstOrDefaultAsync(s => s.Id == sessionId, cancellationToken)
                      ?? throw new NotFoundException("TableSession", sessionId);

        if (session.Status == TableSessionStatus.Closed)
        {
            throw new ConflictException("This session is already closed — items can't be comped now.");
        }

        var round = await db.DineInRounds.FirstOrDefaultAsync(r => r.Id == roundId && r.TableSessionId == sessionId, cancellationToken)
                    ?? throw new NotFoundException("DineInRound", roundId);

        if (round.Status == DineInRoundStatus.Cancelled)
        {
            throw new ConflictException($"Round {round.RoundNumber} is cancelled — its items can't be comped.");
        }

        return await db.DineInRoundItems.FirstOrDefaultAsync(i => i.Id == itemId && i.DineInRoundId == roundId, cancellationToken)
               ?? throw new NotFoundException("DineInRoundItem", itemId);
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

    private BillBreakdown ComputeBillBreakdown(TableSession session)
    {
        var subtotal = session.Rounds.Where(r => r.Status != DineInRoundStatus.Cancelled)
            .SelectMany(r => r.Items)
            .Where(i => !i.IsComped)
            .Sum(i => i.UnitPrice * i.Quantity);

        // Clamped so a discount that was applied against a larger subtotal (e.g. before a round
        // was later cancelled) can never push the bill negative.
        var discountAmount = Math.Min(session.DiscountAmount ?? 0m, subtotal);
        var discountedSubtotal = subtotal - discountAmount;

        var rates = billingOptions.Value;
        var taxAmount = Math.Round(discountedSubtotal * rates.TaxRatePercent / 100m, 2);
        var serviceChargeAmount = Math.Round(discountedSubtotal * rates.ServiceChargePercent / 100m, 2);
        return new BillBreakdown(subtotal, discountAmount, taxAmount, serviceChargeAmount, discountedSubtotal + taxAmount + serviceChargeAmount);
    }

    private static DineInRoundItemDto ToItemDto(DineInRoundItem i) =>
        new(i.Id, i.ProductId, i.ProductName, i.Quantity, i.UnitPrice, i.UnitPrice * i.Quantity, i.IsComped, i.CompReason);

    public async Task<List<KitchenRoundDto>> GetKitchenQueueAsync(CancellationToken cancellationToken)
    {
        // A round can be left behind at Ready if its session was closed without ever being
        // marked served (e.g. the guest left before the waiter caught up) — exclude those, or
        // the kitchen keeps seeing "ready" tickets for tables that have already been reset.
        var activeStatuses = new[] { DineInRoundStatus.Fired, DineInRoundStatus.Preparing, DineInRoundStatus.Ready };
        var openSessionIds = await db.TableSessions.AsNoTracking()
            .Where(s => s.Status != TableSessionStatus.Closed)
            .Select(s => s.Id)
            .ToListAsync(cancellationToken);

        var rounds = await db.DineInRounds.AsNoTracking()
            .Include(r => r.Items)
            .Where(r => activeStatuses.Contains(r.Status) && openSessionIds.Contains(r.TableSessionId))
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

        // Fired -> Preparing -> Ready is as far as the kitchen's own action goes: once a round
        // is plated and Ready, it's the waiter who actually delivers it and knows it's been
        // served — see MarkRoundServedAsync, which the kitchen has no access to.
        var next = round.Status switch
        {
            DineInRoundStatus.Fired => DineInRoundStatus.Preparing,
            DineInRoundStatus.Preparing => DineInRoundStatus.Ready,
            _ => throw new ConflictException($"Round {round.RoundNumber} is {round.Status} and can't be advanced further from the kitchen."),
        };

        round.Status = next;
        await db.SaveChangesAsync(cancellationToken);
        await auditLog.LogAsync("DineInRound.StatusAdvanced", "TableSession", round.TableSessionId.ToString(), $"Round {round.RoundNumber} -> {next}", cancellationToken);

        var session = await db.TableSessions.AsNoTracking().FirstAsync(s => s.Id == round.TableSessionId, cancellationToken);
        var table = await db.DiningTables.AsNoTracking().FirstAsync(t => t.Id == session.TableId, cancellationToken);

        return ToKitchenDto(round, session.Id, table.Label);
    }

    public async Task<TableSessionDto> MarkRoundServedAsync(Guid sessionId, Guid roundId, CancellationToken cancellationToken)
    {
        var round = await db.DineInRounds.FirstOrDefaultAsync(r => r.Id == roundId && r.TableSessionId == sessionId, cancellationToken)
                    ?? throw new NotFoundException("DineInRound", roundId);

        if (round.Status != DineInRoundStatus.Ready)
        {
            throw new ConflictException($"Round {round.RoundNumber} is {round.Status} — it can only be marked served once the kitchen has it ready.");
        }

        round.Status = DineInRoundStatus.Served;
        round.ServedAt = DateTimeOffset.UtcNow;
        await db.SaveChangesAsync(cancellationToken);
        await auditLog.LogAsync("DineInRound.Served", "TableSession", sessionId.ToString(), $"Round {round.RoundNumber} served", cancellationToken);

        return await BuildSessionDtoAsync(sessionId, cancellationToken);
    }

    private static KitchenRoundDto ToKitchenDto(DineInRound round, Guid sessionId, string tableLabel)
    {
        var itemDtos = round.Items.Select(ToItemDto).ToList();
        return new KitchenRoundDto(round.Id, sessionId, tableLabel, round.RoundNumber, round.Status, round.FiredAt, itemDtos);
    }
}
