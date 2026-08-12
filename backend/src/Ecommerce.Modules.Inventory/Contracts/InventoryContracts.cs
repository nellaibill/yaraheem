using Ecommerce.Modules.Inventory.Domain;

namespace Ecommerce.Modules.Inventory.Contracts;

public sealed record InventoryItemDto(Guid ProductId, int QuantityOnHand, int QuantityReserved, int QuantityAvailable);

public sealed record AdjustInventoryRequest(Guid ProductId, int QuantityChange, InventoryTransactionType Type, string? Reference);

public sealed record CreateInventoryAdjustmentRequest(Guid ProductId, int Quantity, InventoryAdjustmentReason Reason, string? Notes);

public sealed record SetStockRequest(int Quantity);
