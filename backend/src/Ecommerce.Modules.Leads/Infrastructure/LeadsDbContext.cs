using Ecommerce.Modules.Leads.Domain;
using Ecommerce.Shared.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Modules.Leads.Infrastructure;

public class LeadsDbContext(DbContextOptions<LeadsDbContext> options) : AuditableDbContext(options)
{
    public const string Schema = "leads";

    public DbSet<ContactMessage> ContactMessages => Set<ContactMessage>();
    public DbSet<CateringInquiry> CateringInquiries => Set<CateringInquiry>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasDefaultSchema(Schema);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(LeadsDbContext).Assembly);
        modelBuilder.ApplySnakeCaseNames();
        base.OnModelCreating(modelBuilder);
    }
}
