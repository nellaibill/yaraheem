using Ecommerce.Modules.Identity.Domain;
using Ecommerce.Shared.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Modules.Identity.Infrastructure;

public class IdentityDbContext(DbContextOptions<IdentityDbContext> options) : AuditableDbContext(options)
{
    public const string Schema = "identity";

    public DbSet<User> Users => Set<User>();
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<UserRole> UserRoles => Set<UserRole>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
    public DbSet<PasswordResetToken> PasswordResetTokens => Set<PasswordResetToken>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasDefaultSchema(Schema);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(IdentityDbContext).Assembly);
        modelBuilder.ApplySnakeCaseNames();
        base.OnModelCreating(modelBuilder);
    }
}
