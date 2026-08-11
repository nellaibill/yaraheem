using Ecommerce.Modules.Cart.Application;
using Ecommerce.Modules.Inventory.Application;
using Ecommerce.Modules.Orders.Contracts;
using Ecommerce.Modules.Orders.Domain;
using Ecommerce.Modules.Orders.Infrastructure;
using Ecommerce.Shared.Kernel;
using Ecommerce.Shared.Kernel.Exceptions;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Modules.Orders.Application;

public sealed class OrderService(OrdersDbContext db, ICartService cartService, IInventoryService inventoryService) : IOrderService
{
    private const int MaxOrderNumberAttempts = 3;

    public async Task<OrderDto> CheckoutAsync(Guid userId, CheckoutRequest request, CancellationToken cancellationToken)
    {
        var cart = await cartService.GetCurrentCartAsync(userId, cancellationToken);
        if (cart.Items.Count == 0)
        {
            throw new ConflictException("Cannot check out an empty cart.");
        }

        var productQuantities = cart.Items
            .GroupBy(i => i.ProductId)
            .ToDictionary(g => g.Key, g => g.Sum(i => i.Quantity));

        await inventoryService.ValidateAndDeductForSaleAsync(productQuantities, reference: $"checkout:{userId}", cancellationToken);

        var order = new Order
        {
            UserId = userId,
            OrderNumber = string.Empty,
            Status = OrderStatus.Pending,
            Subtotal = cart.Subtotal,
            Total = cart.Subtotal,
            ShippingAddress = new Address
            {
                FullName = request.ShippingAddress.FullName,
                PhoneNumber = request.ShippingAddress.PhoneNumber,
                AddressLine1 = request.ShippingAddress.AddressLine1,
                AddressLine2 = request.ShippingAddress.AddressLine2,
                City = request.ShippingAddress.City,
                State = request.ShippingAddress.State,
                PostalCode = request.ShippingAddress.PostalCode,
                Country = request.ShippingAddress.Country,
            },
        };

        foreach (var item in cart.Items)
        {
            order.Items.Add(new OrderItem
            {
                ProductId = item.ProductId,
                ProductVariantId = item.ProductVariantId,
                ProductName = item.ProductName,
                Quantity = item.Quantity,
                UnitPrice = item.UnitPrice,
                LineTotal = item.LineTotal,
            });
        }

        order.StatusHistory.Add(new OrderStatusHistory { Status = OrderStatus.Pending, Note = "Order created" });

        await SaveWithOrderNumberAsync(order, cancellationToken);

        await cartService.ClearCartAsync(userId, cancellationToken);

        return await GetByIdAsync(userId, isAdmin: true, order.Id, cancellationToken);
    }

    public async Task<OrderDto> GetByIdAsync(Guid userId, bool isAdmin, Guid orderId, CancellationToken cancellationToken)
    {
        var order = await LoadOrderQuery().FirstOrDefaultAsync(o => o.Id == orderId, cancellationToken)
                    ?? throw new NotFoundException("Order", orderId);

        if (!isAdmin && order.UserId != userId)
        {
            throw new ForbiddenException("You do not have access to this order.");
        }

        return ToDto(order);
    }

    public async Task<PagedResult<OrderDto>> GetMyOrdersAsync(Guid userId, int page, int pageSize, CancellationToken cancellationToken)
    {
        var query = LoadOrderQuery().Where(o => o.UserId == userId).OrderByDescending(o => o.CreatedAt);

        var totalCount = await query.CountAsync(cancellationToken);
        var orders = await query.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync(cancellationToken);

        return new PagedResult<OrderDto>
        {
            Items = orders.Select(ToDto).ToList(),
            Page = page,
            PageSize = pageSize,
            TotalCount = totalCount,
        };
    }

    public async Task<OrderDto> UpdateStatusAsync(Guid orderId, UpdateOrderStatusRequest request, CancellationToken cancellationToken)
    {
        var order = await LoadOrderQuery().FirstOrDefaultAsync(o => o.Id == orderId, cancellationToken)
                    ?? throw new NotFoundException("Order", orderId);

        order.Status = request.Status;
        order.StatusHistory.Add(new OrderStatusHistory { Status = request.Status, Note = request.Note });

        await db.SaveChangesAsync(cancellationToken);

        return ToDto(order);
    }

    private async Task SaveWithOrderNumberAsync(Order order, CancellationToken cancellationToken)
    {
        for (var attempt = 1; attempt <= MaxOrderNumberAttempts; attempt++)
        {
            order.OrderNumber = await GenerateOrderNumberAsync(cancellationToken);
            db.Orders.Add(order);

            try
            {
                await db.SaveChangesAsync(cancellationToken);
                return;
            }
            catch (DbUpdateException) when (attempt < MaxOrderNumberAttempts)
            {
                db.ChangeTracker.Clear();
            }
        }
    }

    private async Task<string> GenerateOrderNumberAsync(CancellationToken cancellationToken)
    {
        var datePrefix = DateTimeOffset.UtcNow.ToString("yyyyMMdd");
        var prefix = $"ORD-{datePrefix}-";
        var todayCount = await db.Orders.CountAsync(o => o.OrderNumber.StartsWith(prefix), cancellationToken);
        return $"{prefix}{todayCount + 1:D4}";
    }

    private IQueryable<Order> LoadOrderQuery() =>
        db.Orders.AsNoTracking()
            .Include(o => o.ShippingAddress)
            .Include(o => o.Items)
            .Include(o => o.StatusHistory);

    private static OrderDto ToDto(Order o) => new(
        o.Id,
        o.OrderNumber,
        o.UserId,
        o.Status,
        o.Subtotal,
        o.Total,
        new AddressDto(o.ShippingAddress.FullName, o.ShippingAddress.PhoneNumber, o.ShippingAddress.AddressLine1, o.ShippingAddress.AddressLine2, o.ShippingAddress.City, o.ShippingAddress.State, o.ShippingAddress.PostalCode, o.ShippingAddress.Country),
        o.Items.Select(i => new OrderItemDto(i.Id, i.ProductId, i.ProductVariantId, i.ProductName, i.Quantity, i.UnitPrice, i.LineTotal)).ToList(),
        o.StatusHistory.OrderBy(h => h.ChangedAt).Select(h => new OrderStatusHistoryDto(h.Status, h.Note, h.ChangedAt)).ToList(),
        o.CreatedAt);
}
