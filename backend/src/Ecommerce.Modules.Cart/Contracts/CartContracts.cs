namespace Ecommerce.Modules.Cart.Contracts;

public sealed record CartItemDto(
    Guid Id,
    Guid ProductId,
    string ProductName,
    Guid? ProductVariantId,
    string? VariantName,
    int Quantity,
    decimal UnitPrice,
    decimal LineTotal);

public sealed record CartDto(Guid CartId, IReadOnlyList<CartItemDto> Items, decimal Subtotal, int TotalItems);

public sealed record AddCartItemRequest(Guid ProductId, Guid? ProductVariantId, int Quantity);

public sealed record UpdateCartItemRequest(int Quantity);
