using Ecommerce.Modules.Identity.Contracts;

namespace Ecommerce.Modules.Identity.Application;

public interface IOtpService
{
    Task<RequestOtpResponse> RequestAsync(string phoneNumber, CancellationToken cancellationToken);
    Task<VerifyOtpResponse> VerifyAsync(string phoneNumber, string code, CancellationToken cancellationToken);
}
