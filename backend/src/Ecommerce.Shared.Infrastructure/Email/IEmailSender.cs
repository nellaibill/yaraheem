namespace Ecommerce.Shared.Infrastructure.Email;

public interface IEmailSender
{
    Task SendAsync(string toAddress, string subject, string bodyText, CancellationToken cancellationToken);
}
