using Ecommerce.Modules.Settings.Domain;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Ecommerce.Modules.Settings.Infrastructure.Configurations;

public sealed class IntegrationSettingConfiguration : IEntityTypeConfiguration<IntegrationSetting>
{
    public void Configure(EntityTypeBuilder<IntegrationSetting> builder)
    {
        builder.ToTable("integration_settings");
        builder.HasKey(e => e.Id);

        builder.Property(e => e.Key).IsRequired().HasMaxLength(100);
        builder.Property(e => e.EncryptedValue).IsRequired();
        builder.Property(e => e.UpdatedByEmail).HasMaxLength(256);

        builder.HasIndex(e => e.Key).IsUnique();
    }
}
