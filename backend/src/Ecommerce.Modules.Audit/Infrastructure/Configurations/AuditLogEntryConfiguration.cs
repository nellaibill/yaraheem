using Ecommerce.Modules.Audit.Domain;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Ecommerce.Modules.Audit.Infrastructure.Configurations;

public sealed class AuditLogEntryConfiguration : IEntityTypeConfiguration<AuditLogEntry>
{
    public void Configure(EntityTypeBuilder<AuditLogEntry> builder)
    {
        builder.ToTable("audit_log_entries");
        builder.HasKey(e => e.Id);

        builder.Property(e => e.Action).IsRequired().HasMaxLength(100);
        builder.Property(e => e.ActorEmail).HasMaxLength(256);
        builder.Property(e => e.EntityType).HasMaxLength(100);
        builder.Property(e => e.EntityId).HasMaxLength(100);
        builder.Property(e => e.IpAddress).HasMaxLength(64);
        builder.Property(e => e.Details).HasMaxLength(2000);

        builder.HasIndex(e => e.Action);
        builder.HasIndex(e => new { e.EntityType, e.EntityId });
        builder.HasIndex(e => e.CreatedAt);
    }
}
