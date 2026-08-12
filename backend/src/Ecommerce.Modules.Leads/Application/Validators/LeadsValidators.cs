using Ecommerce.Modules.Leads.Contracts;
using FluentValidation;

namespace Ecommerce.Modules.Leads.Application.Validators;

public sealed class SubmitContactMessageRequestValidator : AbstractValidator<SubmitContactMessageRequest>
{
    public SubmitContactMessageRequestValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Email).NotEmpty().EmailAddress().MaximumLength(256);
        RuleFor(x => x.Phone).MaximumLength(30);
        RuleFor(x => x.Subject).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Message).NotEmpty().MaximumLength(4000);
    }
}

public sealed class SubmitCateringInquiryRequestValidator : AbstractValidator<SubmitCateringInquiryRequest>
{
    public SubmitCateringInquiryRequestValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Phone).NotEmpty().MaximumLength(30);
        RuleFor(x => x.Email).EmailAddress().When(x => !string.IsNullOrWhiteSpace(x.Email)).MaximumLength(256);
        RuleFor(x => x.GuestCount).GreaterThan(0).When(x => x.GuestCount.HasValue);
        RuleFor(x => x.PackageName).MaximumLength(200);
        RuleFor(x => x.Message).MaximumLength(4000);
    }
}
