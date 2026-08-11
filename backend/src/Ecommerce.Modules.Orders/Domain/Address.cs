using Ecommerce.Shared.Kernel;

namespace Ecommerce.Modules.Orders.Domain;

public class Address : BaseEntity
{
    public Guid OrderId { get; set; }
    public Order Order { get; set; } = null!;

    public required string FullName { get; set; }
    public required string PhoneNumber { get; set; }
    public required string AddressLine1 { get; set; }
    public string? AddressLine2 { get; set; }
    public required string City { get; set; }
    public required string State { get; set; }
    public required string PostalCode { get; set; }
    public required string Country { get; set; }
}
