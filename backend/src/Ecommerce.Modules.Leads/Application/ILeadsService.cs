using Ecommerce.Modules.Leads.Contracts;

namespace Ecommerce.Modules.Leads.Application;

public interface ILeadsService
{
    Task<ContactMessageDto> SubmitContactMessageAsync(SubmitContactMessageRequest request, CancellationToken cancellationToken);
    Task<IReadOnlyList<ContactMessageDto>> GetContactMessagesAsync(CancellationToken cancellationToken);
    Task<ContactMessageDto> ResolveContactMessageAsync(Guid id, CancellationToken cancellationToken);

    Task<CateringInquiryDto> SubmitCateringInquiryAsync(SubmitCateringInquiryRequest request, CancellationToken cancellationToken);
    Task<IReadOnlyList<CateringInquiryDto>> GetCateringInquiriesAsync(CancellationToken cancellationToken);
    Task<CateringInquiryDto> UpdateCateringInquiryStatusAsync(Guid id, UpdateCateringInquiryStatusRequest request, CancellationToken cancellationToken);
}
