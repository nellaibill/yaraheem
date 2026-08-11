using Ecommerce.Modules.Orders.Domain;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Ecommerce.Modules.Orders.Infrastructure.Configurations;

public sealed class AddressConfiguration : IEntityTypeConfiguration<Address>
{
    public void Configure(EntityTypeBuilder<Address> builder)
    {
        builder.ToTable("addresses");
        builder.HasKey(a => a.Id);

        builder.Property(a => a.FullName).IsRequired().HasMaxLength(200);
        builder.Property(a => a.Line1).IsRequired().HasMaxLength(300);
        builder.Property(a => a.Line2).HasMaxLength(300);
        builder.Property(a => a.City).IsRequired().HasMaxLength(150);
        builder.Property(a => a.State).IsRequired().HasMaxLength(150);
        builder.Property(a => a.PostalCode).IsRequired().HasMaxLength(20);
        builder.Property(a => a.Country).IsRequired().HasMaxLength(100);
        builder.Property(a => a.Phone).HasMaxLength(30);

        builder.HasIndex(a => a.OrderId).IsUnique();
    }
}
