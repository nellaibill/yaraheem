namespace Ecommerce.Shared.Infrastructure.Sms;

public interface ISmsSender
{
    /// <param name="toPhoneNumber">10-digit Indian mobile number, no country code prefix.</param>
    Task SendAsync(string toPhoneNumber, string message, CancellationToken cancellationToken);
}
