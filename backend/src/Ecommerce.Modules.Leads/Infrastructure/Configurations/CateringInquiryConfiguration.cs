using Ecommerce.Modules.Leads.Domain;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Ecommerce.Modules.Leads.Infrastructure.Configurations;

public sealed class CateringInquiryConfiguration : IEntityTypeConfiguration<CateringInquiry>
{
    public void Configure(EntityTypeBuilder<CateringInquiry> builder)
    {
        builder.ToTable("catering_inquiries");
        builder.HasKey(i => i.Id);

        builder.Property(i => i.Name).IsRequired().HasMaxLength(200);
        builder.Property(i => i.Phone).IsRequired().HasMaxLength(30);
        builder.Property(i => i.Email).HasMaxLength(256);
        builder.Property(i => i.PackageName).HasMaxLength(200);
        builder.Property(i => i.Message).HasColumnType("text");
        builder.Property(i => i.Status).HasConversion<string>().HasMaxLength(30);

        builder.HasIndex(i => i.CreatedAt);
        builder.HasIndex(i => i.Status);
    }
}
