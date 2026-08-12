using Ecommerce.Modules.Catalog.Domain;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Ecommerce.Modules.Catalog.Infrastructure.Configurations;

public sealed class ProductVariantConfiguration : IEntityTypeConfiguration<ProductVariant>
{
    public void Configure(EntityTypeBuilder<ProductVariant> builder)
    {
        builder.ToTable("product_variants");
        builder.HasKey(pv => pv.Id);

        builder.Property(pv => pv.Sku).IsRequired().HasMaxLength(100);
        builder.HasIndex(pv => pv.Sku).IsUnique();
        builder.Property(pv => pv.Name).IsRequired().HasMaxLength(150);
        builder.Property(pv => pv.Size).HasMaxLength(50);
        builder.Property(pv => pv.Color).HasMaxLength(50);
        builder.Property(pv => pv.PriceAdjustment).HasColumnType("numeric(12,2)");
        builder.Property(pv => pv.PriceOverride).HasColumnType("numeric(18,2)");

        builder.HasOne(pv => pv.Product)
            .WithMany(p => p.Variants)
            .HasForeignKey(pv => pv.ProductId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
