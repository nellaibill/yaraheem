using Ecommerce.Modules.Payments.Domain;
using Ecommerce.Shared.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Modules.Payments.Infrastructure;

public class PaymentsDbContext(DbContextOptions<PaymentsDbContext> options) : DbContext(options)
{
    public const string Schema = "payments";

    public DbSet<PaymentTransaction> PaymentTransactions => Set<PaymentTransaction>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasDefaultSchema(Schema);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(PaymentsDbContext).Assembly);
        modelBuilder.ApplySnakeCaseNames();
        base.OnModelCreating(modelBuilder);
    }
}
