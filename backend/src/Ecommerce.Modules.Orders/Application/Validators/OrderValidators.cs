using Ecommerce.Modules.Orders.Contracts;
using FluentValidation;

namespace Ecommerce.Modules.Orders.Application.Validators;

public sealed class ShippingAddressRequestValidator : AbstractValidator<ShippingAddressRequest>
{
    public ShippingAddressRequestValidator()
    {
        RuleFor(x => x.FullName).NotEmpty().MaximumLength(200);
        RuleFor(x => x.PhoneNumber).NotEmpty().MaximumLength(30);
        RuleFor(x => x.AddressLine1).NotEmpty().MaximumLength(300);
        RuleFor(x => x.AddressLine2).MaximumLength(300);
        RuleFor(x => x.City).NotEmpty().MaximumLength(150);
        RuleFor(x => x.State).NotEmpty().MaximumLength(150);
        RuleFor(x => x.PostalCode).NotEmpty().MaximumLength(20);
        RuleFor(x => x.Country).NotEmpty().MaximumLength(100);
    }
}

public sealed class CheckoutRequestValidator : AbstractValidator<CheckoutRequest>
{
    public CheckoutRequestValidator()
    {
        RuleFor(x => x.PaymentMethod).NotEmpty()
            .Must(m => m is "COD" or "ONLINE")
            .WithMessage("PaymentMethod must be 'COD' or 'ONLINE'.");
        RuleFor(x => x.ShippingAddress).NotNull().SetValidator(new ShippingAddressRequestValidator());
    }
}

public sealed class UpdateOrderStatusRequestValidator : AbstractValidator<UpdateOrderStatusRequest>
{
    public UpdateOrderStatusRequestValidator()
    {
        RuleFor(x => x.Status).IsInEnum();
        RuleFor(x => x.Notes).MaximumLength(500);
    }
}

public sealed class AdminOrderQueryValidator : AbstractValidator<AdminOrderQuery>
{
    public AdminOrderQueryValidator()
    {
        RuleFor(x => x.Page).GreaterThanOrEqualTo(1);
        RuleFor(x => x.PageSize).InclusiveBetween(1, 100);
        RuleFor(x => x.Status).IsInEnum().When(x => x.Status.HasValue);
    }
}
