using Ecommerce.Modules.Catalog.Domain;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Ecommerce.Modules.Catalog.Infrastructure.Configurations;

public sealed class ProductConfiguration : IEntityTypeConfiguration<Product>
{
    public void Configure(EntityTypeBuilder<Product> builder)
    {
        builder.ToTable("products");
        builder.HasKey(p => p.Id);

        builder.Property(p => p.Name).IsRequired().HasMaxLength(200);
        builder.Property(p => p.Slug).IsRequired().HasMaxLength(200);
        builder.HasIndex(p => p.Slug).IsUnique();
        builder.Property(p => p.Description).HasMaxLength(4000);
        builder.Property(p => p.Sku).IsRequired().HasMaxLength(100);
        builder.HasIndex(p => p.Sku).IsUnique();
        builder.Property(p => p.Price).HasColumnType("numeric(12,2)");
        builder.Property(p => p.ComparePrice).HasColumnType("numeric(12,2)");
        builder.Property(p => p.ThumbnailUrl).HasMaxLength(1000);

        builder.HasOne(p => p.Category)
            .WithMany(c => c.Products)
            .HasForeignKey(p => p.CategoryId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(p => p.CategoryId);
        builder.HasIndex(p => p.Name);
        builder.HasIndex(p => p.IsFeatured);
        builder.HasIndex(p => p.IsPublished);

        builder.HasQueryFilter(p => !p.IsDeleted);
    }
}
