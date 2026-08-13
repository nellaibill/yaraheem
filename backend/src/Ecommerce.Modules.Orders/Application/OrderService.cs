using Ecommerce.Modules.Audit.Application;
using Ecommerce.Modules.Cart.Application;
using Ecommerce.Modules.Coupons.Application;
using Ecommerce.Modules.Coupons.Infrastructure;
using Ecommerce.Modules.Identity.Domain;
using Ecommerce.Modules.Identity.Infrastructure;
using Ecommerce.Modules.Inventory.Application;
using Ecommerce.Modules.Inventory.Infrastructure;
using Ecommerce.Modules.Orders.Contracts;
using Ecommerce.Modules.Orders.Domain;
using Ecommerce.Modules.Orders.Infrastructure;
using Ecommerce.Modules.Payments.Application;
using Ecommerce.Modules.Payments.Contracts;
using Ecommerce.Modules.Payments.Domain;
using Ecommerce.Modules.Payments.Infrastructure;
using Ecommerce.Shared.Infrastructure.Pricing;
using Ecommerce.Shared.Infrastructure.Sms;
using Ecommerce.Shared.Infrastructure.WhatsApp;
using Ecommerce.Shared.Kernel;
using Ecommerce.Shared.Kernel.Exceptions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Npgsql;

namespace Ecommerce.Modules.Orders.Application;

public sealed class OrderService(
    OrdersDbContext db,
    IdentityDbContext identityDb,
    PaymentsDbContext paymentsDb,
    ICartService cartService,
    IPaymentService paymentService,
    IOrderStatusTransitionService transitionService,
    IDeliveryFeeCalculator deliveryFeeCalculator,
    IAuditLogService auditLog,
    ISmsSender smsSender,
    IWhatsAppSender whatsAppSender,
    ILogger<OrderService> logger) : IOrderService
{
    private const int MaxOrderNumberAttempts = 3;

    public async Task<CheckoutResponse> CheckoutAsync(Guid userId, CheckoutRequest request, string? idempotencyKey, CancellationToken cancellationToken)
    {
        if (!string.IsNullOrWhiteSpace(idempotencyKey))
        {
            var replay = await FindByIdempotencyKeyAsync(userId, idempotencyKey, cancellationToken);
            if (replay is not null)
            {
                logger.LogInformation("Checkout replay detected for user {UserId}, idempotency key {IdempotencyKey} — returning existing order {OrderId}.", userId, idempotencyKey, replay.OrderId);
                return replay;
            }
        }

        var cart = await cartService.GetCurrentCartAsync(userId, cancellationToken);
        if (cart.Items.Count == 0)
        {
            throw new ConflictException("Cannot check out an empty cart.");
        }

        var productQuantities = cart.Items
            .GroupBy(i => i.ProductId)
            .ToDictionary(g => g.Key, g => g.Sum(i => i.Quantity));

        // Backend is the sole source of truth for pricing — the frontend only ever displays
        // what gets computed here, never supplies a delivery fee or discount of its own.
        var deliveryFee = deliveryFeeCalculator.Calculate(cart.Subtotal);

        var order = new Order
        {
            UserId = userId,
            OrderNumber = string.Empty,
            Status = OrderStatus.Pending,
            Subtotal = cart.Subtotal,
            DeliveryFee = deliveryFee,
            DiscountAmount = 0m,
            Total = cart.Subtotal + deliveryFee,
            IdempotencyKey = idempotencyKey,
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

        order.StatusHistory.Add(new OrderStatusHistory { PreviousStatus = null, NewStatus = OrderStatus.Pending, Notes = "Order created" });

        var correlationId = Guid.NewGuid();
        logger.LogInformation(
            "Checkout starting. CorrelationId={CorrelationId} UserId={UserId} OrderId={OrderId} ProductCount={ProductCount} Total={Total}",
            correlationId, userId, order.Id, productQuantities.Count, order.Total);

        // --- Transactional core -----------------------------------------------------------
        // Inventory deduction, order creation, and the payment transaction record all live in
        // different schemas/DbContexts but the same physical Postgres database. Sharing one
        // NpgsqlConnection + real ADO.NET transaction across them gives full atomicity without
        // a distributed transaction coordinator (TransactionScope across multiple connections
        // would try to promote to MSDTC, which .NET doesn't support on non-Windows hosts). If
        // any step fails, everything in this block — including the stock deduction — rolls back
        // together, so a crash mid-checkout can never leave stock silently deducted for an
        // order that doesn't exist.
        var connectionString = db.Database.GetConnectionString()
            ?? throw new InvalidOperationException("OrdersDbContext has no connection string configured.");

        await using var connection = new NpgsqlConnection(connectionString);
        await connection.OpenAsync(cancellationToken);
        await using var dbTransaction = await connection.BeginTransactionAsync(cancellationToken);

        await using var txOrdersDb = new OrdersDbContext(new DbContextOptionsBuilder<OrdersDbContext>().UseNpgsql(connection).Options);
        await txOrdersDb.Database.UseTransactionAsync(dbTransaction, cancellationToken);

        await using var txInventoryDb = new InventoryDbContext(new DbContextOptionsBuilder<InventoryDbContext>().UseNpgsql(connection).Options);
        await txInventoryDb.Database.UseTransactionAsync(dbTransaction, cancellationToken);

        await using var txPaymentsDb = new PaymentsDbContext(new DbContextOptionsBuilder<PaymentsDbContext>().UseNpgsql(connection).Options);
        await txPaymentsDb.Database.UseTransactionAsync(dbTransaction, cancellationToken);

        await using var txCouponsDb = new CouponsDbContext(new DbContextOptionsBuilder<CouponsDbContext>().UseNpgsql(connection).Options);
        await txCouponsDb.Database.UseTransactionAsync(dbTransaction, cancellationToken);

        PaymentResult paymentResult;
        try
        {
            // Validate and redeem the coupon (if any) first — row-locked and atomic with the
            // rest of this transaction so two concurrent checkouts can't both redeem the last
            // use of a limited coupon. Fails fast before touching inventory if the code is bad.
            if (!string.IsNullOrWhiteSpace(request.CouponCode))
            {
                var redemption = await new CouponService(txCouponsDb).TryRedeemAsync(userId, request.CouponCode, cart.Subtotal, order.Id, cancellationToken);
                if (!redemption.Success)
                {
                    throw new ConflictException(redemption.ErrorMessage ?? "This coupon could not be applied.");
                }

                order.CouponCode = request.CouponCode.Trim().ToUpperInvariant();
                order.DiscountAmount = redemption.DiscountAmount;
                order.Total = order.Subtotal - redemption.DiscountAmount + order.DeliveryFee;
            }

            // Row-level lock: hold every affected product's inventory row for the rest of this
            // transaction so a concurrent checkout for the same product can't read stock before
            // this one commits its deduction and oversell. Released automatically on commit/rollback.
            var productIds = productQuantities.Keys.ToArray();
            await txInventoryDb.Database.SqlQueryRaw<int>(
                $"SELECT 1 FROM {InventoryDbContext.Schema}.inventory_items WHERE product_id = ANY(@p0) FOR UPDATE",
                productIds).ToListAsync(cancellationToken);

            await new InventoryService(txInventoryDb).ValidateAndDeductForSaleAsync(productQuantities, reference: $"checkout:{userId}", cancellationToken);

            await SaveWithOrderNumberAsync(txOrdersDb, order, cancellationToken);

            paymentResult = await paymentService.ProcessPaymentAsync(order.Id, order.Total, request.PaymentMethod, cancellationToken);

            await new PaymentTransactionService(txPaymentsDb).CreateAsync(
                order.Id, provider: "Dummy", method: request.PaymentMethod, amount: order.Total, currency: "INR",
                status: paymentResult.Status, transactionReference: paymentResult.TransactionReference,
                providerResponse: paymentResult.Message, cancellationToken);

            if (paymentResult.Status == PaymentStatus.Paid)
            {
                ApplyStatusTransition(txOrdersDb, order, OrderStatus.Confirmed, changedByUserId: null, notes: "Payment received");
                await txOrdersDb.SaveChangesAsync(cancellationToken);
            }

            await dbTransaction.CommitAsync(cancellationToken);
        }
        catch (Exception ex)
        {
            await dbTransaction.RollbackAsync(cancellationToken);
            logger.LogError(ex, "Checkout failed and was rolled back. CorrelationId={CorrelationId} UserId={UserId} OrderId={OrderId}", correlationId, userId, order.Id);
            throw;
        }
        // -------------------------------------------------------------------------------------

        logger.LogInformation(
            "Checkout committed. CorrelationId={CorrelationId} OrderId={OrderId} OrderNumber={OrderNumber} PaymentStatus={PaymentStatus}",
            correlationId, order.Id, order.OrderNumber, paymentResult.Status);

        // Cart clearing and the confirmation SMS are best-effort side effects after the order
        // is durably committed — if either fails, that's a UX nuisance, not a stock or money
        // correctness issue, so both deliberately sit outside the transaction above.
        await cartService.ClearCartAsync(userId, cancellationToken);
        await SendOrderNotificationAsync(order.ShippingAddress.PhoneNumber,
            $"Your Ya Raheem order #{order.OrderNumber} for {FormatInr(order.Total)} has been placed. We'll text you as it moves through the kitchen.",
            cancellationToken);

        return new CheckoutResponse(order.Id, order.OrderNumber, paymentResult.Status, paymentResult.TransactionReference);
    }

    private async Task<CheckoutResponse?> FindByIdempotencyKeyAsync(Guid userId, string idempotencyKey, CancellationToken cancellationToken)
    {
        var existing = await db.Orders.AsNoTracking()
            .FirstOrDefaultAsync(o => o.UserId == userId && o.IdempotencyKey == idempotencyKey, cancellationToken);

        if (existing is null)
        {
            return null;
        }

        var existingPayment = await paymentsDb.PaymentTransactions.AsNoTracking()
            .Where(t => t.OrderId == existing.Id)
            .OrderByDescending(t => t.CreatedAt)
            .FirstOrDefaultAsync(cancellationToken);

        return new CheckoutResponse(existing.Id, existing.OrderNumber, existingPayment?.Status ?? PaymentStatus.Pending, existingPayment?.TransactionReference ?? string.Empty);
    }

    public async Task<OrderDto> GetByIdAsync(Guid userId, bool isAdmin, Guid orderId, CancellationToken cancellationToken)
    {
        var order = await LoadOrderQuery().FirstOrDefaultAsync(o => o.Id == orderId, cancellationToken)
                    ?? throw new NotFoundException("Order", orderId);

        if (!isAdmin && order.UserId != userId)
        {
            throw new ForbiddenException("You do not have access to this order.");
        }

        var paymentMethods = await GetPaymentMethodsAsync([order.Id], cancellationToken);
        return ToDto(order, paymentMethods.GetValueOrDefault(order.Id));
    }

    public async Task<PagedResult<OrderDto>> GetMyOrdersAsync(Guid userId, int page, int pageSize, CancellationToken cancellationToken)
    {
        var query = LoadOrderQuery().Where(o => o.UserId == userId).OrderByDescending(o => o.CreatedAt);

        var totalCount = await query.CountAsync(cancellationToken);
        var orders = await query.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync(cancellationToken);
        var paymentMethods = await GetPaymentMethodsAsync(orders.Select(o => o.Id), cancellationToken);

        return new PagedResult<OrderDto>
        {
            Items = orders.Select(o => ToDto(o, paymentMethods.GetValueOrDefault(o.Id))).ToList(),
            Page = page,
            PageSize = pageSize,
            TotalCount = totalCount,
        };
    }

    private static readonly IReadOnlyDictionary<OrderStatus, string> StatusNotificationText = new Dictionary<OrderStatus, string>
    {
        [OrderStatus.Confirmed] = "has been confirmed",
        [OrderStatus.Processing] = "is being prepared",
        [OrderStatus.Shipped] = "is out for delivery",
        [OrderStatus.Delivered] = "has been delivered — enjoy your meal!",
        [OrderStatus.Cancelled] = "has been cancelled",
    };

    public async Task<OrderDto> UpdateStatusAsync(Guid orderId, UpdateOrderStatusRequest request, Guid? changedByUserId, CancellationToken cancellationToken)
    {
        var order = await db.Orders.Include(o => o.StatusHistory).Include(o => o.ShippingAddress).FirstOrDefaultAsync(o => o.Id == orderId, cancellationToken)
                    ?? throw new NotFoundException("Order", orderId);

        var previousStatus = order.Status;
        ApplyStatusTransition(db, order, request.Status, changedByUserId, request.Notes);

        await db.SaveChangesAsync(cancellationToken);

        await auditLog.LogAsync("Order.StatusChanged", "Order", order.Id.ToString(), $"{previousStatus} -> {order.Status}", cancellationToken);

        if (StatusNotificationText.TryGetValue(order.Status, out var statusText))
        {
            await SendOrderNotificationAsync(order.ShippingAddress.PhoneNumber, $"Your Ya Raheem order #{order.OrderNumber} {statusText}.", cancellationToken);
        }

        return await GetByIdAsync(Guid.Empty, isAdmin: true, orderId, cancellationToken);
    }

    /// <summary>Never throws — a notification-delivery failure must not fail the order operation it's attached to.</summary>
    private async Task SendOrderNotificationAsync(string phoneNumber, string message, CancellationToken cancellationToken)
    {
        try
        {
            await smsSender.SendAsync(phoneNumber, message, cancellationToken);
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Order SMS notification failed for {PhoneNumber} — order flow continues regardless.", phoneNumber);
        }

        try
        {
            await whatsAppSender.SendAsync(phoneNumber, message, cancellationToken);
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Order WhatsApp notification failed for {PhoneNumber} — order flow continues regardless.", phoneNumber);
        }
    }

    private static string FormatInr(decimal amount) => $"Rs. {amount:N0}";

    public async Task<PagedResult<OrderDto>> GetAdminOrdersAsync(AdminOrderQuery query, CancellationToken cancellationToken)
    {
        var ordersQuery = LoadOrderQuery();

        if (query.Status.HasValue)
        {
            ordersQuery = ordersQuery.Where(o => o.Status == query.Status.Value);
        }

        if (!string.IsNullOrWhiteSpace(query.OrderNumber))
        {
            ordersQuery = ordersQuery.Where(o => o.OrderNumber == query.OrderNumber);
        }

        if (!string.IsNullOrWhiteSpace(query.CustomerEmail))
        {
            var normalizedEmail = query.CustomerEmail.Trim().ToLowerInvariant();
            var userIds = await identityDb.Users.Where(u => u.Email == normalizedEmail).Select(u => u.Id).ToListAsync(cancellationToken);
            ordersQuery = ordersQuery.Where(o => userIds.Contains(o.UserId));
        }

        if (query.FromDate.HasValue)
        {
            ordersQuery = ordersQuery.Where(o => o.CreatedAt >= query.FromDate.Value);
        }

        if (query.ToDate.HasValue)
        {
            ordersQuery = ordersQuery.Where(o => o.CreatedAt <= query.ToDate.Value);
        }

        ordersQuery = ordersQuery.OrderByDescending(o => o.CreatedAt);

        var totalCount = await ordersQuery.CountAsync(cancellationToken);
        var orders = await ordersQuery.Skip((query.Page - 1) * query.PageSize).Take(query.PageSize).ToListAsync(cancellationToken);
        var paymentMethods = await GetPaymentMethodsAsync(orders.Select(o => o.Id), cancellationToken);

        return new PagedResult<OrderDto>
        {
            Items = orders.Select(o => ToDto(o, paymentMethods.GetValueOrDefault(o.Id))).ToList(),
            Page = query.Page,
            PageSize = query.PageSize,
            TotalCount = totalCount,
        };
    }

    public async Task<OrderTrackingResponse> GetTrackingAsync(Guid userId, bool isAdmin, Guid orderId, CancellationToken cancellationToken)
    {
        var order = await LoadOrderQuery().FirstOrDefaultAsync(o => o.Id == orderId, cancellationToken)
                    ?? throw new NotFoundException("Order", orderId);

        if (!isAdmin && order.UserId != userId)
        {
            throw new ForbiddenException("You do not have access to this order.");
        }

        var timeline = order.StatusHistory
            .OrderBy(h => h.ChangedAt)
            .Select(h => new OrderTrackingEventDto(h.NewStatus, h.ChangedAt))
            .ToList();

        return new OrderTrackingResponse(order.OrderNumber, order.Status, order.UpdatedAt ?? order.CreatedAt, timeline);
    }

    public async Task MarkOrderConfirmedFromPaymentAsync(Guid orderId, CancellationToken cancellationToken)
    {
        var order = await LoadTrackedOrderQuery().FirstOrDefaultAsync(o => o.Id == orderId, cancellationToken)
                    ?? throw new NotFoundException("Order", orderId);

        if (order.Status == OrderStatus.Confirmed)
        {
            return;
        }

        ApplyStatusTransition(db, order, OrderStatus.Confirmed, changedByUserId: null, notes: "Payment received");
        await db.SaveChangesAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<CustomerSummaryDto>> GetCustomerSummariesAsync(CancellationToken cancellationToken)
    {
        var normalizedCustomerRole = Role.WellKnown.Customer.ToUpperInvariant();
        var users = await identityDb.Users.AsNoTracking()
            .Where(u => u.UserRoles.Any(ur => ur.Role.NormalizedName == normalizedCustomerRole))
            .ToListAsync(cancellationToken);

        var orderStats = await db.Orders.AsNoTracking()
            .GroupBy(o => o.UserId)
            .Select(g => new
            {
                UserId = g.Key,
                OrderCount = g.Count(),
                TotalSpent = g.Sum(o => o.Total),
                LastOrderAt = g.Max(o => o.CreatedAt),
            })
            .ToDictionaryAsync(x => x.UserId, cancellationToken);

        return users
            .Select(u =>
            {
                orderStats.TryGetValue(u.Id, out var stats);
                return new CustomerSummaryDto(
                    u.Id, u.Email, u.FirstName, u.LastName, u.PhoneNumber, u.CreatedAt,
                    stats?.OrderCount ?? 0, stats?.TotalSpent ?? 0m, stats?.LastOrderAt);
            })
            .OrderByDescending(c => c.TotalSpent)
            .ToList();
    }

    private void ApplyStatusTransition(OrdersDbContext targetDb, Order order, OrderStatus newStatus, Guid? changedByUserId, string? notes)
    {
        transitionService.EnsureValidTransition(order.Status, newStatus);

        // Adding only via order.StatusHistory.Add(...) on an already-persisted (tracked,
        // not newly-Added) Order leaves EF Core unable to tell this new child apart from an
        // existing one with the same client-generated Guid key — it gets queued as an UPDATE
        // instead of an INSERT, which then matches 0 rows and throws a spurious
        // DbUpdateConcurrencyException. Adding it to the DbSet directly forces EF to track it
        // as Added regardless of how the parent Order is currently tracked.
        var historyEntry = new OrderStatusHistory
        {
            OrderId = order.Id,
            PreviousStatus = order.Status,
            NewStatus = newStatus,
            ChangedByUserId = changedByUserId,
            Notes = notes,
        };
        targetDb.OrderStatusHistories.Add(historyEntry);
        order.StatusHistory.Add(historyEntry);

        order.Status = newStatus;
    }

    private async Task SaveWithOrderNumberAsync(OrdersDbContext targetDb, Order order, CancellationToken cancellationToken)
    {
        for (var attempt = 1; attempt <= MaxOrderNumberAttempts; attempt++)
        {
            order.OrderNumber = await GenerateOrderNumberAsync(targetDb, cancellationToken);
            targetDb.Orders.Add(order);

            try
            {
                await targetDb.SaveChangesAsync(cancellationToken);
                return;
            }
            catch (DbUpdateException) when (attempt < MaxOrderNumberAttempts)
            {
                targetDb.ChangeTracker.Clear();
            }
        }
    }

    private static async Task<string> GenerateOrderNumberAsync(OrdersDbContext targetDb, CancellationToken cancellationToken)
    {
        var datePrefix = DateTimeOffset.UtcNow.ToString("yyyyMMdd");
        var prefix = $"ORD-{datePrefix}-";
        var todayCount = await targetDb.Orders.CountAsync(o => o.OrderNumber.StartsWith(prefix), cancellationToken);
        return $"{prefix}{todayCount + 1:D4}";
    }

    /// <summary>
    /// Latest payment transaction's method per order, for display only (e.g. invoices).
    /// Orders/Payments are separate modules/schemas, so this is a batched cross-module read
    /// rather than a foreign key — consistent with how Cart reads Catalog's Product directly.
    /// </summary>
    private async Task<Dictionary<Guid, string>> GetPaymentMethodsAsync(IEnumerable<Guid> orderIds, CancellationToken cancellationToken)
    {
        var ids = orderIds.Distinct().ToList();
        if (ids.Count == 0)
        {
            return [];
        }

        var transactions = await paymentsDb.PaymentTransactions.AsNoTracking()
            .Where(t => ids.Contains(t.OrderId))
            .ToListAsync(cancellationToken);

        return transactions
            .GroupBy(t => t.OrderId)
            .ToDictionary(g => g.Key, g => g.OrderByDescending(t => t.CreatedAt).First().PaymentMethod);
    }

    private IQueryable<Order> LoadOrderQuery() =>
        db.Orders.AsNoTracking()
            .Include(o => o.ShippingAddress)
            .Include(o => o.Items)
            .Include(o => o.StatusHistory)
            .AsSplitQuery();

    private IQueryable<Order> LoadTrackedOrderQuery() =>
        db.Orders
            .Include(o => o.ShippingAddress)
            .Include(o => o.Items)
            .Include(o => o.StatusHistory)
            .AsSplitQuery();

    private static OrderDto ToDto(Order o, string? paymentMethod) => new(
        o.Id, o.OrderNumber, o.UserId, o.Status, o.Subtotal, o.DeliveryFee, o.DiscountAmount, o.CouponCode, o.Total,
        new AddressDto(o.ShippingAddress.FullName, o.ShippingAddress.PhoneNumber, o.ShippingAddress.AddressLine1, o.ShippingAddress.AddressLine2, o.ShippingAddress.City, o.ShippingAddress.State, o.ShippingAddress.PostalCode, o.ShippingAddress.Country),
        o.Items.Select(i => new OrderItemDto(i.Id, i.ProductId, i.ProductVariantId, i.ProductName, i.Quantity, i.UnitPrice, i.LineTotal)).ToList(),
        o.StatusHistory.OrderBy(h => h.ChangedAt).Select(h => new OrderStatusHistoryDto(h.PreviousStatus, h.NewStatus, h.Notes, h.ChangedAt)).ToList(),
        o.CreatedAt,
        paymentMethod);
}
