namespace Ecommerce.Shared.Infrastructure.Options;

public sealed class SerilogOptions
{
    public const string SectionName = "SerilogOptions";

    public string MinimumLevel { get; set; } = "Information";
    public string LogFilePath { get; set; } = "logs/log-.txt";
    public int RetainedFileCountLimit { get; set; } = 14;
}
