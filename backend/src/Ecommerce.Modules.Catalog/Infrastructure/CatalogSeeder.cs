using Ecommerce.Modules.Catalog.Domain;
using Ecommerce.Modules.Inventory.Domain;
using Ecommerce.Modules.Inventory.Infrastructure;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Modules.Catalog.Infrastructure;

// Seed data mirrors the real Ya Raheem frontend menu (src/features/menu/data/menuData.ts) and its
// verified dish photos (src/lib/foodImages.ts), not placeholder/generic products — names, prices,
// descriptions, categories, and image URLs are copied from those files. Four dishes have no
// verified photo in the frontend (it falls back to a generated visual for them); those are seeded
// with a null ThumbnailUrl/no ProductImage to match, rather than inventing an image.
public static class CatalogSeeder
{
    private sealed record CategorySeed(string Key, string Name, int DisplayOrder);

    private sealed record ProductSeed(
        string Id, string Name, string Description, decimal Price, string CategoryKey,
        bool IsFeatured, string? ImageUrl);

    private static readonly CategorySeed[] Categories =
    [
        new("biryani", "Biryani", 1),
        new("rice-noodles", "Rice & Noodles", 2),
        new("chicken-specials", "Chicken Specials", 3),
        new("burgers-wraps", "Burgers & Wraps", 4),
        new("sides-breads", "Sides & Breads", 5),
        new("beverages", "Beverages", 6),
        new("combos", "Combos & Packs", 7),
        new("desserts", "Desserts", 8),
    ];

    private static readonly ProductSeed[] Products =
    [
        new("chicken-biryani", "Nellai Chicken Biryani",
            "Seeraga samba rice dum-cooked with bone-in chicken, our house masala, and fried onions — the everyday favorite.",
            220m, "biryani", true,
            "https://upload.wikimedia.org/wikipedia/commons/5/5a/Chicken_biriyani_%40_Star_Ambur_Biriyani_%287519153014%29.jpg"),
        new("mandi-biryani", "Chicken Mandi",
            "Slow-roasted chicken over fragrant mandi rice, finished with our smoky Friday-special spice blend.",
            280m, "biryani", true,
            "https://upload.wikimedia.org/wikipedia/commons/1/13/Mandi_Biryani.jpg"),
        new("bucket-biryani", "Family Bucket Biryani",
            "A full bucket of seeraga samba chicken biryani, generously portioned to feed 4 — weekend favorite.",
            650m, "biryani", true,
            "https://upload.wikimedia.org/wikipedia/commons/9/98/The_Red_Bucket_Biryani.jpg"),
        new("chicken-fried-rice", "Chicken Fried Rice",
            "Wok-tossed rice with shredded chicken, spring onion, and soy — a lunch-counter classic.",
            180m, "rice-noodles", false,
            "https://upload.wikimedia.org/wikipedia/commons/5/5b/Chicken_fried_rice_-_Stir_Fry_by_CK_2023-12-02.jpg"),
        new("veg-fried-rice", "Veg Fried Rice",
            "Fresh vegetables and rice tossed on a high flame with soy and garlic.",
            150m, "rice-noodles", false, null),
        new("chicken-noodles", "Chicken Noodles",
            "Hakka-style noodles stir-fried with chicken strips, capsicum, and a touch of chilli-garlic sauce.",
            180m, "rice-noodles", false,
            "https://upload.wikimedia.org/wikipedia/commons/6/6e/Chicken_noodles_01.jpg"),
        new("butter-chicken", "Butter Chicken",
            "Char-grilled chicken simmered in a rich tomato-butter gravy — always a Sunday table favorite.",
            260m, "chicken-specials", false,
            "https://upload.wikimedia.org/wikipedia/commons/4/44/Butter_Chicken_%282446546141%29.jpg"),
        new("chicken-65", "Chicken 65",
            "Deep-fried, curry-leaf-tossed chicken bites in our fiery house masala — the item everyone reorders.",
            200m, "chicken-specials", true,
            "https://upload.wikimedia.org/wikipedia/commons/5/5d/Chicken_65_%28Dish%29.jpg"),
        new("pepper-chicken", "Pepper Chicken",
            "Dry-roasted chicken tossed in cracked black pepper and curry leaves — bold and smoky.",
            220m, "chicken-specials", false,
            "https://upload.wikimedia.org/wikipedia/commons/1/1c/Dakshin_-_kozhi_varuval_%28332922772%29.jpg"),
        new("grill-chicken", "Grill Chicken",
            "A quarter chicken marinated overnight and grilled fresh to order, char-kissed and juicy.",
            240m, "chicken-specials", false,
            "https://upload.wikimedia.org/wikipedia/commons/c/c3/Chicken_Drumsticks_on_a_Grill.jpg"),
        new("bbq-chicken", "BBQ Chicken",
            "Smoky barbecue-glazed chicken pieces, char-grilled and basted till sticky-sweet.",
            260m, "chicken-specials", false,
            "https://upload.wikimedia.org/wikipedia/commons/9/9d/BBQ_Chicken_at_Craigs_BBQ.jpg"),
        new("fried-chicken", "Fried Chicken (4 pcs)",
            "Crispy golden fried chicken, our late-night bestseller for a reason.",
            200m, "chicken-specials", true,
            "https://upload.wikimedia.org/wikipedia/commons/f/fc/Fried_Crispy_chicken.jpg"),
        new("french-fries", "French Fries",
            "Golden, crispy-edged fries tossed with house seasoning — the go-to side for any order.",
            100m, "sides-breads", false,
            "https://upload.wikimedia.org/wikipedia/commons/c/c8/McDonald%27s_French_Fries%2C_Canada%2C_2026-04-04.jpg"),
        new("chicken-burger", "Chicken Burger",
            "A crispy fried chicken patty stacked with lettuce, house mayo, and pickles in a soft bun.",
            150m, "burgers-wraps", false,
            "https://upload.wikimedia.org/wikipedia/commons/b/b1/Chicken-burger-combo_%281%29.jpg"),
        new("parotta", "Parotta (2 pcs)",
            "Flaky, hand-layered parotta, hot off the tawa — the ultimate pairing for any gravy.",
            40m, "sides-breads", true,
            "https://upload.wikimedia.org/wikipedia/commons/f/f8/Parotta_from_Kerala.jpg"),
        new("shawarma", "Chicken Shawarma Roll",
            "Spiced, spit-style chicken shreds rolled in flatbread with garlic sauce and pickled veggies.",
            120m, "burgers-wraps", false,
            "https://upload.wikimedia.org/wikipedia/commons/8/8e/Chicken_Shawarma_Wrap_-_Lavash_2024-09-11.jpg"),
        new("mojito", "Virgin Mojito",
            "Fresh mint and lime muddled with soda over ice — a cooling counter to the spice.",
            90m, "beverages", false,
            "https://upload.wikimedia.org/wikipedia/commons/7/77/Mojito_Cocktail.jpg"),
        new("jigarthanda", "Jigarthanda",
            "The Madurai classic — almond gum, sarsaparilla syrup, milk, and ice cream layered cold.",
            80m, "beverages", true, null),
        new("paruthi-paal", "Paruthi Paal",
            "Traditional Tirunelveli cotton-seed milk, lightly sweetened and served chilled.",
            70m, "beverages", false, null),
        new("family-combo", "Family Combo",
            "A complete meal for 4 — bucket biryani, Chicken 65, fries, and drinks, ready to share.",
            899m, "combos", true,
            "https://upload.wikimedia.org/wikipedia/commons/5/5d/Veg_Full_Meals_in_Tamil_Nadu.JPG"),
        new("party-combo", "Party Combo",
            "Built for a get-together of 10 — biryani, grilled chicken, sides, and drinks, all in one order.",
            1999m, "combos", false,
            "https://images.pexels.com/photos/12253094/pexels-photo-12253094.jpeg?cs=srgb&dl=pexels-stewphotography-12253094.jpg&fm=jpg"),
        new("festival-combo", "Festival Combo",
            "A full banana-leaf feast for 15–20 guests — our most-booked catering combo for celebrations.",
            2999m, "combos", true,
            "https://upload.wikimedia.org/wikipedia/commons/f/fc/A_thali_served_on_banana_leaf_during_a_wedding%2C_south_India.jpg"),
        new("tirunelveli-halwa", "Tirunelveli Halwa",
            "The town's signature wheat halwa — glossy, ghee-rich, and served the traditional way.",
            60m, "desserts", true, null),
    ];

    public static async Task SeedAsync(CatalogDbContext catalogDb, InventoryDbContext inventoryDb, CancellationToken cancellationToken = default)
    {
        if (await catalogDb.Categories.AnyAsync(cancellationToken))
        {
            return;
        }

        var categoriesByKey = Categories.ToDictionary(
            c => c.Key,
            c => new Category { Name = c.Name, Slug = c.Key, DisplayOrder = c.DisplayOrder });

        catalogDb.Categories.AddRange(categoriesByKey.Values);
        await catalogDb.SaveChangesAsync(cancellationToken);

        var products = Products.Select(p =>
        {
            var product = new Product
            {
                Name = p.Name,
                Slug = p.Id,
                Description = p.Description,
                Sku = $"YR-{p.Id.ToUpperInvariant()}",
                Price = p.Price,
                ThumbnailUrl = p.ImageUrl,
                CategoryId = categoriesByKey[p.CategoryKey].Id,
                IsFeatured = p.IsFeatured,
                IsPublished = true,
            };

            if (p.ImageUrl is not null)
            {
                product.Images.Add(new ProductImage
                {
                    ImageUrl = p.ImageUrl,
                    AltText = $"{p.Name} photo",
                    DisplayOrder = 0,
                    IsPrimary = true,
                });
            }

            return product;
        }).ToList();

        catalogDb.Products.AddRange(products);
        await catalogDb.SaveChangesAsync(cancellationToken);

        inventoryDb.InventoryItems.AddRange(products.Select(p => new InventoryItem { ProductId = p.Id, QuantityOnHand = 100 }));
        await inventoryDb.SaveChangesAsync(cancellationToken);
    }
}
