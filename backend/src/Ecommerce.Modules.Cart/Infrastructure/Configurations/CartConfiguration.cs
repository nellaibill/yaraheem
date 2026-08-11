using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Ecommerce.Modules.Cart.Infrastructure.Configurations;

public sealed class CartConfiguration : IEntityTypeConfiguration<Domain.Cart>
{
    public void Configure(EntityTypeBuilder<Domain.Cart> builder)
    {
        builder.ToTable("carts");
        builder.HasKey(c => c.Id);
        builder.HasIndex(c => c.UserId).IsUnique();
    }
}
