using Ecommerce.Shared.Kernel;

namespace Ecommerce.Modules.Leads.Domain;

public class ContactMessage : BaseEntity
{
    public required string Name { get; set; }
    public required string Email { get; set; }
    public string? Phone { get; set; }
    public required string Subject { get; set; }
    public required string Message { get; set; }
    public bool IsResolved { get; set; }
}
