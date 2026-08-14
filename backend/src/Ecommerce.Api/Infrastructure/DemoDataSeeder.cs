using Ecommerce.Modules.Catalog.Domain;
using Ecommerce.Modules.Catalog.Infrastructure;
using Ecommerce.Modules.Delivery.Domain;
using Ecommerce.Modules.Delivery.Infrastructure;
using Ecommerce.Modules.DineIn.Domain;
using Ecommerce.Modules.DineIn.Infrastructure;
using Ecommerce.Modules.Identity.Infrastructure;
using Ecommerce.Modules.Inventory.Application;
using Ecommerce.Modules.Orders.Domain;
using Ecommerce.Modules.Orders.Infrastructure;
using Ecommerce.Modules.Payments.Domain;
using Ecommerce.Modules.Payments.Infrastructure;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Api.Infrastructure;

/// <summary>
/// Wipes transactional demo data (orders, delivery assignments, dine-in sessions) and reseeds a
/// small curated dataset so a sales demo shows a "lived-in" restaurant instead of either an empty
/// shell or the messy accumulated state of ad-hoc manual testing. Reference data — products,
/// dining tables, user accounts — is left untouched; only transactional rows are cleared.
/// </summary>
public static class DemoDataSeeder
{
    public static async Task ResetAsync(
        OrdersDbContext ordersDb,
        PaymentsDbContext paymentsDb,
        DeliveryDbContext deliveryDb,
        DineInDbContext dineInDb,
        IdentityDbContext identityDb,
        CatalogDbContext catalogDb,
        IInventoryService inventoryService,
        CancellationToken cancellationToken)
    {
        // Cross-module references have no DB-level FK/cascade (different schemas), so each has
        // to be cleared explicitly. Orders itself cascades to its own OrderItems/
        // OrderStatusHistory/Address; TableSessions cascades to its own Rounds/Items/Payments.
        await deliveryDb.OrderDeliveryAssignments.ExecuteDeleteAsync(cancellationToken);
        await paymentsDb.PaymentTransactions.ExecuteDeleteAsync(cancellationToken);
        await ordersDb.Orders.ExecuteDeleteAsync(cancellationToken);

        await dineInDb.TableSessions.ExecuteDeleteAsync(cancellationToken);
        await dineInDb.DiningTables.ExecuteUpdateAsync(s => s.SetProperty(t => t.Status, DiningTableStatus.Available), cancellationToken);

        var products = await catalogDb.Products.AsNoTracking()
            .Where(p => p.IsPublished && p.IsActive)
            .OrderBy(p => p.Name)
            .ToListAsync(cancellationToken);

        foreach (var product in products)
        {
            await inventoryService.SetStockAsync(product.Id, 50, cancellationToken);
        }

        if (products.Count < 8)
        {
            return; // not enough catalog data to build a sensible demo on top of
        }

        var customer1 = await identityDb.Users.FirstOrDefaultAsync(u => u.Email == "customer1@ecommerce.local", cancellationToken);
        var customer2 = await identityDb.Users.FirstOrDefaultAsync(u => u.Email == "customer2@ecommerce.local", cancellationToken);
        var waiter = await identityDb.Users.FirstOrDefaultAsync(u => u.Email == "waiter1@ecommerce.local", cancellationToken);
        var partner1User = await identityDb.Users.FirstOrDefaultAsync(u => u.Email == "partner1@ecommerce.local", cancellationToken);
        var partner2User = await identityDb.Users.FirstOrDefaultAsync(u => u.Email == "partner2@ecommerce.local", cancellationToken);

        if (customer1 is null || customer2 is null || waiter is null)
        {
            return; // base seed accounts missing — nothing sensible to build demo data on top of
        }

        var partner1 = partner1User is null ? null : await deliveryDb.DeliveryPartners.FirstOrDefaultAsync(p => p.UserId == partner1User.Id, cancellationToken);
        var partner2 = partner2User is null ? null : await deliveryDb.DeliveryPartners.FirstOrDefaultAsync(p => p.UserId == partner2User.Id, cancellationToken);

        await SeedOrdersAsync(ordersDb, paymentsDb, deliveryDb, customer1.Id, customer2.Id, partner1?.Id, partner2?.Id, products, cancellationToken);
        await SeedDineInAsync(dineInDb, waiter.Id, products, cancellationToken);
    }

    private static async Task SeedOrdersAsync(
        OrdersDbContext ordersDb,
        PaymentsDbContext paymentsDb,
        DeliveryDbContext deliveryDb,
        Guid customer1Id,
        Guid customer2Id,
        Guid? partner1Id,
        Guid? partner2Id,
        List<Product> products,
        CancellationToken cancellationToken)
    {
        var datePrefix = DateTimeOffset.UtcNow.ToString("yyyyMMdd");

        var specs = new (string Number, Guid UserId, string Name, Product Product, OrderStatus Status, PaymentStatus Payment, Guid? PartnerId, DeliveryAssignmentStatus? DeliveryStatus)[]
        {
            ("0001", customer1Id, "Demo Customer1", products[0], OrderStatus.Pending, PaymentStatus.Pending, null, null),
            ("0002", customer2Id, "Demo Customer2", products[1], OrderStatus.Confirmed, PaymentStatus.Paid, null, null),
            ("0003", customer1Id, "Demo Customer1", products[2], OrderStatus.Processing, PaymentStatus.Paid, null, null),
            ("0004", customer2Id, "Demo Customer2", products[3], OrderStatus.Shipped, PaymentStatus.Paid, partner1Id, DeliveryAssignmentStatus.OutForDelivery),
            ("0005", customer1Id, "Demo Customer1", products[4], OrderStatus.Delivered, PaymentStatus.Paid, partner2Id, DeliveryAssignmentStatus.Delivered),
            ("0006", customer2Id, "Demo Customer2", products[5], OrderStatus.Cancelled, PaymentStatus.Failed, null, null),
        };

        foreach (var spec in specs)
        {
            const decimal deliveryFee = 40m;
            var total = spec.Product.Price + deliveryFee;

            var order = new Order
            {
                UserId = spec.UserId,
                OrderNumber = $"ORD-{datePrefix}-{spec.Number}",
                Status = spec.Status,
                Subtotal = spec.Product.Price,
                DeliveryFee = deliveryFee,
                DiscountAmount = 0m,
                Total = total,
                ShippingAddress = new Address
                {
                    FullName = spec.Name,
                    PhoneNumber = "9999999999",
                    AddressLine1 = "1 MG Road",
                    City = "Chennai",
                    State = "Tamil Nadu",
                    PostalCode = "600001",
                    Country = "India",
                },
            };

            order.Items.Add(new OrderItem
            {
                ProductId = spec.Product.Id,
                ProductName = spec.Product.Name,
                Quantity = 1,
                UnitPrice = spec.Product.Price,
                LineTotal = spec.Product.Price,
            });

            order.StatusHistory.Add(new OrderStatusHistory { PreviousStatus = null, NewStatus = OrderStatus.Pending, Notes = "Order placed" });
            if (spec.Status != OrderStatus.Pending)
            {
                order.StatusHistory.Add(new OrderStatusHistory { PreviousStatus = OrderStatus.Pending, NewStatus = spec.Status, Notes = $"Seeded to {spec.Status}" });
            }

            ordersDb.Orders.Add(order);
            await ordersDb.SaveChangesAsync(cancellationToken);

            var now = DateTimeOffset.UtcNow;
            paymentsDb.PaymentTransactions.Add(new PaymentTransaction
            {
                OrderId = order.Id,
                PaymentProvider = "Dummy",
                PaymentMethod = "COD",
                TransactionReference = $"PAY-{datePrefix}-SEED{spec.Number}",
                Amount = order.Total,
                Currency = "INR",
                Status = spec.Payment,
                CreatedAt = now,
                UpdatedAt = now,
            });
            await paymentsDb.SaveChangesAsync(cancellationToken);

            if (spec.PartnerId is { } partnerId && spec.DeliveryStatus is { } deliveryStatus)
            {
                deliveryDb.OrderDeliveryAssignments.Add(new OrderDeliveryAssignment
                {
                    OrderId = order.Id,
                    DeliveryPartnerId = partnerId,
                    Status = deliveryStatus,
                });
                await deliveryDb.SaveChangesAsync(cancellationToken);
            }
        }
    }

    private static async Task SeedDineInAsync(DineInDbContext dineInDb, Guid waiterUserId, List<Product> products, CancellationToken cancellationToken)
    {
        var tables = await dineInDb.DiningTables.OrderBy(t => t.Label).Take(3).ToListAsync(cancellationToken);
        if (tables.Count < 3)
        {
            return;
        }

        var now = DateTimeOffset.UtcNow;
        var openedAtA = now.AddMinutes(-90);
        var openedAtB = now.AddMinutes(-15);
        var openedAtC = now.AddMinutes(-60);

        // Table A: closed, single Cash payment — a clean "finished tab" story.
        var closedA = new TableSession
        {
            TableId = tables[0].Id,
            OpenedByUserId = waiterUserId,
            GuestCount = 2,
            Status = TableSessionStatus.Closed,
            ClosedAt = now.AddMinutes(-45),
        };
        var roundA = new DineInRound
        {
            TableSessionId = closedA.Id,
            RoundNumber = 1,
            Status = DineInRoundStatus.Served,
            FiredAt = now.AddMinutes(-85),
            ServedAt = now.AddMinutes(-70),
        };
        AddRoundItems(roundA, products, 0, 1);
        closedA.Rounds.Add(roundA);
        var totalA = roundA.Items.Sum(i => i.UnitPrice * i.Quantity);
        closedA.Payments.Add(new DineInPayment
        {
            TableSessionId = closedA.Id,
            Label = "Full bill",
            Amount = totalA,
            Method = "Cash",
            Status = DineInPaymentStatus.Paid,
            PaidAt = now.AddMinutes(-46),
        });
        closedA.TotalAmount = totalA;
        closedA.PaymentMethod = "Cash";
        dineInDb.TableSessions.Add(closedA);
        tables[0].Status = DiningTableStatus.Available;

        // Table B: still open, one round at each kitchen stage — populates the Kitchen Queue's
        // three lanes for the demo instead of leaving it empty.
        var openB = new TableSession
        {
            TableId = tables[1].Id,
            OpenedByUserId = waiterUserId,
            GuestCount = 3,
            Status = TableSessionStatus.Open,
        };
        var roundB1 = new DineInRound { TableSessionId = openB.Id, RoundNumber = 1, Status = DineInRoundStatus.Ready, FiredAt = now.AddMinutes(-12) };
        var roundB2 = new DineInRound { TableSessionId = openB.Id, RoundNumber = 2, Status = DineInRoundStatus.Preparing, FiredAt = now.AddMinutes(-7) };
        var roundB3 = new DineInRound { TableSessionId = openB.Id, RoundNumber = 3, Status = DineInRoundStatus.Fired, FiredAt = now.AddMinutes(-2) };
        AddRoundItems(roundB1, products, 1, 1);
        AddRoundItems(roundB2, products, 2, 2);
        AddRoundItems(roundB3, products, 4, 1);
        openB.Rounds.Add(roundB1);
        openB.Rounds.Add(roundB2);
        openB.Rounds.Add(roundB3);
        dineInDb.TableSessions.Add(openB);
        tables[1].Status = DiningTableStatus.Occupied;

        // Table C: closed with a split payment (Cash + UPI) — shows off split billing.
        var closedC = new TableSession
        {
            TableId = tables[2].Id,
            OpenedByUserId = waiterUserId,
            GuestCount = 4,
            Status = TableSessionStatus.Closed,
            ClosedAt = now.AddMinutes(-20),
        };
        var roundC = new DineInRound
        {
            TableSessionId = closedC.Id,
            RoundNumber = 1,
            Status = DineInRoundStatus.Served,
            FiredAt = now.AddMinutes(-55),
            ServedAt = now.AddMinutes(-40),
        };
        AddRoundItems(roundC, products, 6, 2);
        closedC.Rounds.Add(roundC);
        var totalC = roundC.Items.Sum(i => i.UnitPrice * i.Quantity);
        var shareC = Math.Round(totalC / 2, 2);
        closedC.Payments.Add(new DineInPayment { TableSessionId = closedC.Id, Label = "Split 1", Amount = shareC, Method = "Cash", Status = DineInPaymentStatus.Paid, PaidAt = now.AddMinutes(-21) });
        closedC.Payments.Add(new DineInPayment { TableSessionId = closedC.Id, Label = "Split 2", Amount = totalC - shareC, Method = "UPI", Status = DineInPaymentStatus.Paid, PaidAt = now.AddMinutes(-20) });
        closedC.TotalAmount = totalC;
        closedC.PaymentMethod = "Cash + UPI";
        dineInDb.TableSessions.Add(closedC);
        tables[2].Status = DiningTableStatus.Available;

        await dineInDb.SaveChangesAsync(cancellationToken);

        // AuditableDbContext stamps CreatedAt = now for every Added row on save, overwriting the
        // backdated values above — fix it up afterward with a direct update that bypasses that
        // interceptor, so "Opened" reads before "Closed" in the admin session list.
        await dineInDb.TableSessions.Where(s => s.Id == closedA.Id).ExecuteUpdateAsync(s => s.SetProperty(x => x.CreatedAt, openedAtA), cancellationToken);
        await dineInDb.TableSessions.Where(s => s.Id == openB.Id).ExecuteUpdateAsync(s => s.SetProperty(x => x.CreatedAt, openedAtB), cancellationToken);
        await dineInDb.TableSessions.Where(s => s.Id == closedC.Id).ExecuteUpdateAsync(s => s.SetProperty(x => x.CreatedAt, openedAtC), cancellationToken);
    }

    private static void AddRoundItems(DineInRound round, List<Product> products, int startIndex, int count)
    {
        for (var i = 0; i < count; i++)
        {
            var product = products[(startIndex + i) % products.Count];
            round.Items.Add(new DineInRoundItem
            {
                DineInRoundId = round.Id,
                ProductId = product.Id,
                ProductName = product.Name,
                Quantity = 1,
                UnitPrice = product.Price,
            });
        }
    }
}
