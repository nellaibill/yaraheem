namespace Ecommerce.Modules.Inventory.Domain;

public enum InventoryTransactionType
{
    Restock = 1,
    Sale = 2,
    Reservation = 3,
    ReservationReleased = 4,
    Adjustment = 5,
}
