using Ecommerce.Modules.Cart.Contracts;
using Ecommerce.Modules.Cart.Infrastructure;
using Ecommerce.Modules.Catalog.Infrastructure;
using Ecommerce.Shared.Kernel.Exceptions;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Modules.Cart.Application;

public sealed class CartService(CartDbContext cartDb, CatalogDbContext catalogDb) : ICartService
{
    public async Task<CartDto> GetCurrentCartAsync(Guid userId, CancellationToken cancellationToken)
    {
        var cart = await GetOrCreateCartAsync(userId, cancellationToken);
        return await BuildCartDtoAsync(cart, cancellationToken);
    }

    public async Task<CartDto> AddItemAsync(Guid userId, AddCartItemRequest request, CancellationToken cancellationToken)
    {
        var cart = await GetOrCreateCartAsync(userId, cancellationToken);

        var product = await catalogDb.Products.AsNoTracking()
            .FirstOrDefaultAsync(p => p.Id == request.ProductId && p.IsActive, cancellationToken)
            ?? throw new NotFoundException("Product", request.ProductId);

        var unitPrice = product.Price;

        if (request.ProductVariantId.HasValue)
        {
            var variant = await catalogDb.ProductVariants.AsNoTracking()
                .FirstOrDefaultAsync(v => v.Id == request.ProductVariantId && v.ProductId == request.ProductId && v.IsActive, cancellationToken)
                ?? throw new NotFoundException("ProductVariant", request.ProductVariantId);
            unitPrice += variant.PriceAdjustment;
        }

        var existingItem = await cartDb.CartItems.FirstOrDefaultAsync(
            i => i.CartId == cart.Id && i.ProductId == request.ProductId && i.ProductVariantId == request.ProductVariantId,
            cancellationToken);

        if (existingItem is not null)
        {
            existingItem.Quantity += request.Quantity;
            existingItem.UnitPrice = unitPrice;
        }
        else
        {
            cartDb.CartItems.Add(new Domain.CartItem
            {
                CartId = cart.Id,
                ProductId = request.ProductId,
                ProductVariantId = request.ProductVariantId,
                Quantity = request.Quantity,
                UnitPrice = unitPrice,
            });
        }

        await cartDb.SaveChangesAsync(cancellationToken);
        return await BuildCartDtoAsync(cart, cancellationToken);
    }

    public async Task<CartDto> UpdateItemQuantityAsync(Guid userId, Guid itemId, UpdateCartItemRequest request, CancellationToken cancellationToken)
    {
        var cart = await GetOrCreateCartAsync(userId, cancellationToken);

        var item = await cartDb.CartItems.FirstOrDefaultAsync(i => i.Id == itemId && i.CartId == cart.Id, cancellationToken)
                   ?? throw new NotFoundException("CartItem", itemId);

        item.Quantity = request.Quantity;
        await cartDb.SaveChangesAsync(cancellationToken);

        return await BuildCartDtoAsync(cart, cancellationToken);
    }

    public async Task<CartDto> RemoveItemAsync(Guid userId, Guid itemId, CancellationToken cancellationToken)
    {
        var cart = await GetOrCreateCartAsync(userId, cancellationToken);

        var item = await cartDb.CartItems.FirstOrDefaultAsync(i => i.Id == itemId && i.CartId == cart.Id, cancellationToken)
                   ?? throw new NotFoundException("CartItem", itemId);

        cartDb.CartItems.Remove(item);
        await cartDb.SaveChangesAsync(cancellationToken);

        return await BuildCartDtoAsync(cart, cancellationToken);
    }

    public async Task ClearCartAsync(Guid userId, CancellationToken cancellationToken)
    {
        var cart = await GetOrCreateCartAsync(userId, cancellationToken);
        var items = await cartDb.CartItems.Where(i => i.CartId == cart.Id).ToListAsync(cancellationToken);
        cartDb.CartItems.RemoveRange(items);
        await cartDb.SaveChangesAsync(cancellationToken);
    }

    private async Task<Domain.Cart> GetOrCreateCartAsync(Guid userId, CancellationToken cancellationToken)
    {
        var cart = await cartDb.Carts.FirstOrDefaultAsync(c => c.UserId == userId, cancellationToken);
        if (cart is not null) return cart;

        cart = new Domain.Cart { UserId = userId };
        cartDb.Carts.Add(cart);
        await cartDb.SaveChangesAsync(cancellationToken);
        return cart;
    }

    private async Task<CartDto> BuildCartDtoAsync(Domain.Cart cart, CancellationToken cancellationToken)
    {
        var items = await cartDb.CartItems.AsNoTracking().Where(i => i.CartId == cart.Id).ToListAsync(cancellationToken);

        var productIds = items.Select(i => i.ProductId).Distinct().ToList();
        var variantIds = items.Where(i => i.ProductVariantId.HasValue).Select(i => i.ProductVariantId!.Value).Distinct().ToList();

        var products = await catalogDb.Products.AsNoTracking()
            .Where(p => productIds.Contains(p.Id))
            .ToDictionaryAsync(p => p.Id, cancellationToken);

        var variants = await catalogDb.ProductVariants.AsNoTracking()
            .Where(v => variantIds.Contains(v.Id))
            .ToDictionaryAsync(v => v.Id, cancellationToken);

        var itemDtos = items.Select(i =>
        {
            var productName = products.TryGetValue(i.ProductId, out var product) ? product.Name : "Unknown product";
            string? variantName = null;
            if (i.ProductVariantId.HasValue && variants.TryGetValue(i.ProductVariantId.Value, out var variant))
            {
                variantName = variant.Name;
            }

            return new CartItemDto(i.Id, i.ProductId, productName, i.ProductVariantId, variantName, i.Quantity, i.UnitPrice, i.UnitPrice * i.Quantity);
        }).ToList();

        return new CartDto(cart.Id, itemDtos, itemDtos.Sum(i => i.LineTotal));
    }
}
