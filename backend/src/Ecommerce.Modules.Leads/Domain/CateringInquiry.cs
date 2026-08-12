using Ecommerce.Shared.Kernel;

namespace Ecommerce.Modules.Leads.Domain;

public class CateringInquiry : BaseEntity
{
    public required string Name { get; set; }
    public required string Phone { get; set; }
    public string? Email { get; set; }
    public DateOnly? EventDate { get; set; }
    public int? GuestCount { get; set; }
    public string? PackageName { get; set; }
    public string? Message { get; set; }
    public CateringInquiryStatus Status { get; set; } = CateringInquiryStatus.New;
}
