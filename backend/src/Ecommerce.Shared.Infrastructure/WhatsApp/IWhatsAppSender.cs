namespace Ecommerce.Shared.Infrastructure.WhatsApp;

public interface IWhatsAppSender
{
    /// <param name="toPhoneNumber">10-digit Indian mobile number, no country code prefix.</param>
    Task SendAsync(string toPhoneNumber, string message, CancellationToken cancellationToken);
}
