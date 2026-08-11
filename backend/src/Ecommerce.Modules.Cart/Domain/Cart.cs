using Ecommerce.Shared.Kernel;

namespace Ecommerce.Modules.Cart.Domain;

public class Cart : BaseEntity
{
    public Guid UserId { get; set; }

    public ICollection<CartItem> Items { get; set; } = [];
}
