using Ecommerce.Modules.Payments.Contracts;
using Ecommerce.Modules.Payments.Domain;
using FluentValidation;

namespace Ecommerce.Modules.Payments.Application.Validators;

public sealed class PaymentWebhookRequestValidator : AbstractValidator<PaymentWebhookRequest>
{
    public PaymentWebhookRequestValidator()
    {
        RuleFor(x => x.TransactionReference).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Status).NotEmpty()
            .Must(status => Enum.TryParse<PaymentStatus>(status, true, out _))
            .WithMessage("Status must be a valid payment status.");
        RuleFor(x => x.Provider).NotEmpty().MaximumLength(50);
    }
}
