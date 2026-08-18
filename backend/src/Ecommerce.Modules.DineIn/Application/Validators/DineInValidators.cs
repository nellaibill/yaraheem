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

public sealed class ApplySessionDiscountRequestValidator : AbstractValidator<ApplySessionDiscountRequest>
{
    public ApplySessionDiscountRequestValidator()
    {
        RuleFor(x => x.Amount).GreaterThan(0);
        RuleFor(x => x.Reason).NotEmpty().MaximumLength(200);
    }
}

public sealed class CompRoundItemRequestValidator : AbstractValidator<CompRoundItemRequest>
{
    public CompRoundItemRequestValidator()
    {
        RuleFor(x => x.Reason).NotEmpty().MaximumLength(200);
    }
}

public sealed class CreateDineInPaymentRequestValidator : AbstractValidator<CreateDineInPaymentRequest>
{
    private static readonly string[] AllowedMethods = ["Cash", "UPI", "Card", "Razorpay"];

    public CreateDineInPaymentRequestValidator()
    {
        RuleFor(x => x.Amount).GreaterThan(0);
        RuleFor(x => x.Method).NotEmpty().Must(AllowedMethods.Contains)
            .WithMessage("Method must be one of Cash, UPI, Card, Razorpay.");
    }
}

public sealed class VerifyDineInPaymentRequestValidator : AbstractValidator<VerifyDineInPaymentRequest>
{
    public VerifyDineInPaymentRequestValidator()
    {
        RuleFor(x => x.RazorpayPaymentId).NotEmpty();
        RuleFor(x => x.RazorpaySignature).NotEmpty();
    }
}
