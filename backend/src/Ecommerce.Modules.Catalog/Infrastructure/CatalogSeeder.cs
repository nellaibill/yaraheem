using Ecommerce.Modules.Catalog.Domain;
using Ecommerce.Modules.Inventory.Domain;
using Ecommerce.Modules.Inventory.Infrastructure;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Modules.Catalog.Infrastructure;

public static class CatalogSeeder
{
    public static async Task SeedAsync(CatalogDbContext catalogDb, InventoryDbContext inventoryDb, CancellationToken cancellationToken = default)
    {
        if (await catalogDb.Categories.AnyAsync(cancellationToken))
        {
            return;
        }

        var electronics = new Category { Name = "Electronics", Slug = "electronics", DisplayOrder = 1 };
        var fashion = new Category { Name = "Fashion", Slug = "fashion", DisplayOrder = 2 };
        var homeKitchen = new Category { Name = "Home & Kitchen", Slug = "home-kitchen", DisplayOrder = 3 };

        catalogDb.Categories.AddRange(electronics, fashion, homeKitchen);
        await catalogDb.SaveChangesAsync(cancellationToken);

        var products = new[]
        {
            CreateProduct("Wireless Bluetooth Earbuds", "wireless-bluetooth-earbuds", "EL-001", 2499m, 2999m, electronics.Id, isFeatured: true, stock: 50),
            CreateProduct("Smart LED Bulb 9W", "smart-led-bulb-9w", "EL-002", 399m, null, electronics.Id, isFeatured: false, stock: 200),
            CreateProduct("Men's Cotton T-Shirt", "mens-cotton-t-shirt", "FA-001", 599m, 799m, fashion.Id, isFeatured: true, stock: 100),
            CreateProduct("Women's Denim Jacket", "womens-denim-jacket", "FA-002", 1999m, null, fashion.Id, isFeatured: false, stock: 40),
            CreateProduct("Stainless Steel Cookware Set", "stainless-steel-cookware-set", "HK-001", 3499m, 3999m, homeKitchen.Id, isFeatured: true, stock: 25),
            CreateProduct("Non-Stick Frying Pan", "non-stick-frying-pan", "HK-002", 899m, null, homeKitchen.Id, isFeatured: false, stock: 60),
        };

        catalogDb.Products.AddRange(products.Select(p => p.Product));
        await catalogDb.SaveChangesAsync(cancellationToken);

        inventoryDb.InventoryItems.AddRange(products.Select(p => new InventoryItem { ProductId = p.Product.Id, QuantityOnHand = p.Stock }));
        await inventoryDb.SaveChangesAsync(cancellationToken);
    }

    private static (Product Product, int Stock) CreateProduct(
        string name, string slug, string sku, decimal price, decimal? comparePrice, Guid categoryId, bool isFeatured, int stock)
    {
        var product = new Product
        {
            Name = name,
            Slug = slug,
            Description = $"{name} — demo product seeded for the {slug} catalog.",
            Sku = sku,
            Price = price,
            ComparePrice = comparePrice,
            ThumbnailUrl = $"https://picsum.photos/seed/{sku}/400/400",
            CategoryId = categoryId,
            IsFeatured = isFeatured,
            IsPublished = true,
        };

        return (product, stock);
    }
}
