using Ecommerce.Modules.Inventory.Contracts;
using Ecommerce.Modules.Inventory.Domain;
using Ecommerce.Modules.Inventory.Infrastructure;
using Ecommerce.Shared.Kernel;
using Ecommerce.Shared.Kernel.Exceptions;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Modules.Inventory.Application;

public sealed class InventoryService(InventoryDbContext db) : IInventoryService
{
    public async Task<InventoryItemDto> AdjustAsync(AdjustInventoryRequest request, CancellationToken cancellationToken)
    {
        var item = await db.InventoryItems.FirstOrDefaultAsync(i => i.ProductId == request.ProductId, cancellationToken);
        if (item is null)
        {
            item = new InventoryItem { ProductId = request.ProductId };
            db.InventoryItems.Add(item);
        }

        var newQuantityOnHand = item.QuantityOnHand + request.QuantityChange;
        if (newQuantityOnHand < 0)
        {
            throw new ConflictException("Adjustment would result in negative stock.");
        }

        item.QuantityOnHand = newQuantityOnHand;

        db.InventoryTransactions.Add(new InventoryTransaction
        {
            InventoryItem = item,
            Type = request.Type,
            QuantityChange = request.QuantityChange,
            Reference = request.Reference,
        });

        await db.SaveChangesAsync(cancellationToken);

        return new InventoryItemDto(item.ProductId, item.QuantityOnHand, item.QuantityReserved, item.QuantityAvailable);
    }

    public async Task<IReadOnlyDictionary<Guid, int>> GetAvailableQuantitiesAsync(IEnumerable<Guid> productIds, CancellationToken cancellationToken)
    {
        var ids = productIds.Distinct().ToList();
        var items = await db.InventoryItems.AsNoTracking().Where(i => ids.Contains(i.ProductId)).ToListAsync(cancellationToken);
        return items.ToDictionary(i => i.ProductId, i => i.QuantityAvailable);
    }

    public async Task ValidateAndDeductForSaleAsync(IReadOnlyDictionary<Guid, int> productQuantities, string reference, CancellationToken cancellationToken)
    {
        var productIds = productQuantities.Keys.ToList();
        var items = await db.InventoryItems.Where(i => productIds.Contains(i.ProductId)).ToListAsync(cancellationToken);
        var itemsByProduct = items.ToDictionary(i => i.ProductId);

        var insufficient = productQuantities
            .Where(pq => !itemsByProduct.TryGetValue(pq.Key, out var item) || item.QuantityAvailable < pq.Value)
            .Select(pq => pq.Key.ToString())
            .ToList();

        if (insufficient.Count > 0)
        {
            throw new ConflictException($"Insufficient stock for product(s): {string.Join(", ", insufficient)}.");
        }

        foreach (var (productId, quantity) in productQuantities)
        {
            var item = itemsByProduct[productId];
            item.QuantityOnHand -= quantity;

            db.InventoryTransactions.Add(new InventoryTransaction
            {
                InventoryItem = item,
                Type = InventoryTransactionType.Sale,
                QuantityChange = -quantity,
                Reference = reference,
            });
        }

        await db.SaveChangesAsync(cancellationToken);
    }

    public async Task<PagedResult<InventoryItemDto>> GetAllAsync(int page, int pageSize, CancellationToken cancellationToken)
    {
        var query = db.InventoryItems.AsNoTracking().OrderBy(i => i.ProductId);

        var totalCount = await query.CountAsync(cancellationToken);
        var items = await query.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync(cancellationToken);

        return new PagedResult<InventoryItemDto>
        {
            Items = items.Select(ToDto).ToList(),
            Page = page,
            PageSize = pageSize,
            TotalCount = totalCount,
        };
    }

    public async Task<IReadOnlyList<InventoryItemDto>> GetLowStockAsync(int threshold, CancellationToken cancellationToken)
    {
        var items = await db.InventoryItems.AsNoTracking()
            .Where(i => i.QuantityOnHand <= threshold)
            .OrderBy(i => i.QuantityOnHand)
            .ToListAsync(cancellationToken);

        return items.Select(ToDto).ToList();
    }

    public async Task<InventoryItemDto> SetStockAsync(Guid productId, int quantity, CancellationToken cancellationToken)
    {
        if (quantity < 0)
        {
            throw new ConflictException("Stock quantity cannot be negative.");
        }

        var item = await db.InventoryItems.FirstOrDefaultAsync(i => i.ProductId == productId, cancellationToken);
        if (item is null)
        {
            item = new InventoryItem { ProductId = productId };
            db.InventoryItems.Add(item);
        }

        var delta = quantity - item.QuantityOnHand;
        item.QuantityOnHand = quantity;

        if (delta != 0)
        {
            db.InventoryTransactions.Add(new InventoryTransaction
            {
                InventoryItem = item,
                Type = InventoryTransactionType.Adjustment,
                QuantityChange = delta,
                Reference = InventoryAdjustmentReason.ManualCorrection.ToString(),
                Notes = "Stock set directly by admin.",
            });
        }

        await db.SaveChangesAsync(cancellationToken);

        return ToDto(item);
    }

    public async Task<InventoryItemDto> CreateAdjustmentAsync(CreateInventoryAdjustmentRequest request, CancellationToken cancellationToken)
    {
        var item = await db.InventoryItems.FirstOrDefaultAsync(i => i.ProductId == request.ProductId, cancellationToken);
        if (item is null)
        {
            item = new InventoryItem { ProductId = request.ProductId };
            db.InventoryItems.Add(item);
        }

        var newQuantityOnHand = item.QuantityOnHand + request.Quantity;
        if (newQuantityOnHand < 0)
        {
            throw new ConflictException("Adjustment would result in negative stock.");
        }

        item.QuantityOnHand = newQuantityOnHand;

        db.InventoryTransactions.Add(new InventoryTransaction
        {
            InventoryItem = item,
            Type = InventoryTransactionType.Adjustment,
            QuantityChange = request.Quantity,
            Reference = request.Reason.ToString(),
            Notes = request.Notes,
        });

        await db.SaveChangesAsync(cancellationToken);

        return ToDto(item);
    }

    private static InventoryItemDto ToDto(InventoryItem i) => new(i.ProductId, i.QuantityOnHand, i.QuantityReserved, i.QuantityAvailable);
}
