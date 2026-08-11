using Ecommerce.Modules.Catalog.Infrastructure;
using Ecommerce.Modules.Identity.Infrastructure;
using Ecommerce.Modules.Orders.Domain;
using Ecommerce.Modules.Payments.Domain;
using Ecommerce.Modules.Payments.Infrastructure;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Modules.Orders.Infrastructure;

public static class OrdersSeeder
{
    private static readonly OrderStatus[] ProgressionChain =
        [OrderStatus.Confirmed, OrderStatus.Processing, OrderStatus.Shipped];

    public static async Task SeedAsync(
        OrdersDbContext ordersDb,
        IdentityDbContext identityDb,
        CatalogDbContext catalogDb,
        PaymentsDbContext paymentsDb,
        CancellationToken cancellationToken = default)
    {
        if (await ordersDb.Orders.AnyAsync(cancellationToken))
        {
            return;
        }

        var customer1 = await identityDb.Users.FirstOrDefaultAsync(u => u.Email == "customer1@ecommerce.local", cancellationToken);
        var customer2 = await identityDb.Users.FirstOrDefaultAsync(u => u.Email == "customer2@ecommerce.local", cancellationToken);
        var products = await catalogDb.Products.OrderBy(p => p.Name).Take(3).ToListAsync(cancellationToken);

        if (customer1 is null || customer2 is null || products.Count == 0)
        {
            return;
        }

        var specs = new[]
        {
            (Number: "0001", User: customer1, Product: products[0], Target: OrderStatus.Pending),
            (Number: "0002", User: customer2, Product: products[Math.Min(1, products.Count - 1)], Target: OrderStatus.Processing),
            (Number: "0003", User: customer1, Product: products[Math.Min(2, products.Count - 1)], Target: OrderStatus.Shipped),
        };

        var datePrefix = DateTimeOffset.UtcNow.ToString("yyyyMMdd");

        foreach (var spec in specs)
        {
            var order = new Order
            {
                UserId = spec.User.Id,
                OrderNumber = $"ORD-{datePrefix}-{spec.Number}",
                Status = OrderStatus.Pending,
                Subtotal = spec.Product.Price,
                Total = spec.Product.Price,
                ShippingAddress = new Address
                {
                    FullName = $"{spec.User.FirstName} {spec.User.LastName}",
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

            order.StatusHistory.Add(new OrderStatusHistory { PreviousStatus = null, NewStatus = OrderStatus.Pending, Notes = "Order created" });

            foreach (var next in ProgressionChain)
            {
                if (next > spec.Target)
                {
                    break;
                }

                order.StatusHistory.Add(new OrderStatusHistory { PreviousStatus = order.Status, NewStatus = next, Notes = $"Seeded transition to {next}" });
                order.Status = next;
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
                Status = PaymentStatus.Pending,
                CreatedAt = now,
                UpdatedAt = now,
            });
            await paymentsDb.SaveChangesAsync(cancellationToken);
        }
    }
}
