using Ecommerce.Modules.Identity.Domain;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Ecommerce.Modules.Identity.Infrastructure.Configurations;

public sealed class OtpChallengeConfiguration : IEntityTypeConfiguration<OtpChallenge>
{
    public void Configure(EntityTypeBuilder<OtpChallenge> builder)
    {
        builder.ToTable("otp_challenges");
        builder.HasKey(o => o.Id);

        builder.Property(o => o.PhoneNumber).IsRequired().HasMaxLength(20);
        builder.Property(o => o.CodeHash).IsRequired().HasMaxLength(128);

        builder.HasIndex(o => o.PhoneNumber);
    }
}
