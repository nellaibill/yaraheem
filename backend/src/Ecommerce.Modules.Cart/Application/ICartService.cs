using Ecommerce.Modules.Cart.Contracts;

namespace Ecommerce.Modules.Cart.Application;

public interface ICartService
{
    Task<CartDto> GetCurrentCartAsync(Guid userId, CancellationToken cancellationToken);
    Task<CartDto> AddItemAsync(Guid userId, AddCartItemRequest request, CancellationToken cancellationToken);
    Task<CartDto> UpdateItemQuantityAsync(Guid userId, Guid itemId, UpdateCartItemRequest request, CancellationToken cancellationToken);
    Task<CartDto> RemoveItemAsync(Guid userId, Guid itemId, CancellationToken cancellationToken);
    Task ClearCartAsync(Guid userId, CancellationToken cancellationToken);
}
