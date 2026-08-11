using Ecommerce.Modules.Cart.Domain;
using Ecommerce.Shared.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Modules.Cart.Infrastructure;

public class CartDbContext(DbContextOptions<CartDbContext> options) : AuditableDbContext(options)
{
    public const string Schema = "cart";

    public DbSet<Domain.Cart> Carts => Set<Domain.Cart>();
    public DbSet<CartItem> CartItems => Set<CartItem>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasDefaultSchema(Schema);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(CartDbContext).Assembly);
        modelBuilder.ApplySnakeCaseNames();
        base.OnModelCreating(modelBuilder);
    }
}
