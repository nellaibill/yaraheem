using Ecommerce.Modules.DineIn.Contracts;
using FluentValidation;

namespace Ecommerce.Modules.DineIn.Application.Validators;

public sealed class CreateDiningTableRequestValidator : AbstractValidator<CreateDiningTableRequest>
{
    public CreateDiningTableRequestValidator()
    {
        RuleFor(x => x.Label).NotEmpty().MaximumLength(50);
        RuleFor(x => x.Capacity).GreaterThan(0);
    }
}

public sealed class UpdateDiningTableRequestValidator : AbstractValidator<UpdateDiningTableRequest>
{
    public UpdateDiningTableRequestValidator()
    {
        RuleFor(x => x.Label).NotEmpty().MaximumLength(50);
        RuleFor(x => x.Capacity).GreaterThan(0);
        RuleFor(x => x.Status).IsInEnum();
    }
}

public sealed class OpenTableSessionRequestValidator : AbstractValidator<OpenTableSessionRequest>
{
    public OpenTableSessionRequestValidator()
    {
        RuleFor(x => x.GuestCount).GreaterThan(0);
    }
}

public sealed class FireRoundRequestValidator : AbstractValidator<FireRoundRequest>
{
    public FireRoundRequestValidator()
    {
        RuleFor(x => x.Items).NotEmpty();
        RuleForEach(x => x.Items).ChildRules(item =>
        {
            item.RuleFor(i => i.ProductId).NotEmpty();
            item.RuleFor(i => i.Quantity).GreaterThan(0);
        });
    }
}

public sealed class CloseTableSessionRequestValidator : AbstractValidator<CloseTableSessionRequest>
{
    public CloseTableSessionRequestValidator()
    {
        RuleFor(x => x.PaymentMethod).NotEmpty().MaximumLength(20);
    }
}
