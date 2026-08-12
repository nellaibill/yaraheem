using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Ecommerce.Modules.Catalog.Infrastructure;

// Development-only startup check. The frontend's product photos are external URLs (Wikimedia/Pexels),
// not local files, so this audits for the equivalent failure mode: a published product with no
// thumbnail and no ProductImage at all, which would render as a broken/placeholder image in the UI.
public static class CatalogAssetAuditor
{
    public static async Task AuditAsync(CatalogDbContext db, ILogger logger, CancellationToken cancellationToken = default)
    {
        var missing = await db.Products.AsNoTracking()
            .Where(p => p.IsPublished && p.ThumbnailUrl == null && !p.Images.Any())
            .Select(p => new { p.Id, p.Name, p.Slug })
            .ToListAsync(cancellationToken);

        foreach (var product in missing)
        {
            logger.LogWarning(
                "Catalog asset audit: published product {ProductName} ({Slug}, {ProductId}) has no thumbnail or images.",
                product.Name, product.Slug, product.Id);
        }

        logger.LogInformation("Catalog asset audit complete: {MissingCount} published product(s) without an image.", missing.Count);
    }
}
