using Ecommerce.Modules.Cart.Application;
using Ecommerce.Modules.Orders.Contracts;
using Ecommerce.Modules.Orders.Domain;
using Ecommerce.Modules.Orders.Infrastructure;
using Ecommerce.Shared.Kernel;
using Ecommerce.Shared.Kernel.Exceptions;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Modules.Orders.Application;

public sealed class OrderService(OrdersDbContext db, ICartService cartService) : IOrderService
{
    public async Task<OrderDto> CreateFromCartAsync(Guid userId, CreateOrderRequest request, CancellationToken cancellationToken)
    {
        var cart = await cartService.GetCurrentCartAsync(userId, cancellationToken);
        if (cart.Items.Count == 0)
        {
            throw new ConflictException("Cannot create an order from an empty cart.");
        }

        var order = new Order
        {
            UserId = userId,
            Status = OrderStatus.Pending,
            Subtotal = cart.Total,
            Total = cart.Total,
            ShippingAddress = new Address
            {
                FullName = request.ShippingAddress.FullName,
                Line1 = request.ShippingAddress.Line1,
                Line2 = request.ShippingAddress.Line2,
                City = request.ShippingAddress.City,
                State = request.ShippingAddress.State,
                PostalCode = request.ShippingAddress.PostalCode,
                Country = request.ShippingAddress.Country,
                Phone = request.ShippingAddress.Phone,
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

        db.Orders.Add(order);
        await db.SaveChangesAsync(cancellationToken);

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

    private IQueryable<Order> LoadOrderQuery() =>
        db.Orders.AsNoTracking()
            .Include(o => o.ShippingAddress)
            .Include(o => o.Items)
            .Include(o => o.StatusHistory);

    private static OrderDto ToDto(Order o) => new(
        o.Id,
        o.UserId,
        o.Status,
        o.Subtotal,
        o.Total,
        new AddressDto(o.ShippingAddress.FullName, o.ShippingAddress.Line1, o.ShippingAddress.Line2, o.ShippingAddress.City, o.ShippingAddress.State, o.ShippingAddress.PostalCode, o.ShippingAddress.Country, o.ShippingAddress.Phone),
        o.Items.Select(i => new OrderItemDto(i.Id, i.ProductId, i.ProductVariantId, i.ProductName, i.Quantity, i.UnitPrice, i.LineTotal)).ToList(),
        o.StatusHistory.OrderBy(h => h.ChangedAt).Select(h => new OrderStatusHistoryDto(h.Status, h.Note, h.ChangedAt)).ToList(),
        o.CreatedAt);
}
