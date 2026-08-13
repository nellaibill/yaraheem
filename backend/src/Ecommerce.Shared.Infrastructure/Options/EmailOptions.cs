namespace Ecommerce.Shared.Infrastructure.Options;

public sealed class EmailOptions
{
    public const string SectionName = "Email";

    /// <summary>Empty/unset means no real SMTP provider is configured — LoggingEmailSender is used instead.</summary>
    public string? SmtpHost { get; set; }
    public int SmtpPort { get; set; } = 587;
    public string? SmtpUsername { get; set; }
    public string? SmtpPassword { get; set; }
    public bool UseSsl { get; set; } = true;
    public string FromAddress { get; set; } = "no-reply@yaraheem.local";
    public string FromName { get; set; } = "Ya Raheem";
}
