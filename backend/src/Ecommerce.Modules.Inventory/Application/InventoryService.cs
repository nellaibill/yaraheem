using Ecommerce.Modules.Inventory.Contracts;
using Ecommerce.Modules.Inventory.Domain;
using Ecommerce.Modules.Inventory.Infrastructure;
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
}
