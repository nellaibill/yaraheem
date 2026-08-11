using Ecommerce.Modules.Inventory.Contracts;
using FluentValidation;

namespace Ecommerce.Modules.Inventory.Application.Validators;

public sealed class AdjustInventoryRequestValidator : AbstractValidator<AdjustInventoryRequest>
{
    public AdjustInventoryRequestValidator()
    {
        RuleFor(x => x.ProductId).NotEmpty();
        RuleFor(x => x.QuantityChange).NotEqual(0);
        RuleFor(x => x.Type).IsInEnum();
        RuleFor(x => x.Reference).MaximumLength(200);
    }
}
