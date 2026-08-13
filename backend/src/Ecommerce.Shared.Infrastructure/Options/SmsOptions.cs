namespace Ecommerce.Shared.Infrastructure.Options;

public sealed class SmsOptions
{
    public const string SectionName = "Sms";

    /// <summary>Empty/unset means no real SMS provider is configured — LoggingSmsSender is used instead.</summary>
    public string? Msg91ApiKey { get; set; }

    /// <summary>DLT-registered template id in the MSG91 account, containing a single variable ("VAR1") for the message body.</summary>
    public string? Msg91TemplateId { get; set; }

    /// <summary>6-character DLT-registered sender id (e.g. "YARAHM").</summary>
    public string Msg91SenderId { get; set; } = "YARAHM";
}
