using Ecommerce.Modules.Delivery.Contracts;
using FluentValidation;

namespace Ecommerce.Modules.Delivery.Application.Validators;

public sealed class CreateDeliveryPartnerRequestValidator : AbstractValidator<CreateDeliveryPartnerRequest>
{
    public CreateDeliveryPartnerRequestValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(150);
        RuleFor(x => x.PhoneNumber).NotEmpty().MaximumLength(20);
        RuleFor(x => x.VehicleType).NotEmpty().MaximumLength(30);
        RuleFor(x => x.Email).NotEmpty().EmailAddress().MaximumLength(256);
        RuleFor(x => x.Password).NotEmpty().MinimumLength(8);
    }
}

public sealed class UpdateDeliveryPartnerRequestValidator : AbstractValidator<UpdateDeliveryPartnerRequest>
{
    public UpdateDeliveryPartnerRequestValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(150);
        RuleFor(x => x.PhoneNumber).NotEmpty().MaximumLength(20);
        RuleFor(x => x.VehicleType).NotEmpty().MaximumLength(30);
        RuleFor(x => x.Status).IsInEnum();
    }
}

public sealed class AssignDeliveryRequestValidator : AbstractValidator<AssignDeliveryRequest>
{
    public AssignDeliveryRequestValidator()
    {
        RuleFor(x => x.DeliveryPartnerId).NotEmpty();
    }
}

public sealed class UpdateDeliveryStatusRequestValidator : AbstractValidator<UpdateDeliveryStatusRequest>
{
    public UpdateDeliveryStatusRequestValidator()
    {
        RuleFor(x => x.Status).IsInEnum();
    }
}
