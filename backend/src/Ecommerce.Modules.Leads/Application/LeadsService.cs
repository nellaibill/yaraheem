using Ecommerce.Modules.Leads.Contracts;
using Ecommerce.Modules.Leads.Domain;
using Ecommerce.Modules.Leads.Infrastructure;
using Ecommerce.Shared.Kernel.Exceptions;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Modules.Leads.Application;

public sealed class LeadsService(LeadsDbContext db) : ILeadsService
{
    public async Task<ContactMessageDto> SubmitContactMessageAsync(SubmitContactMessageRequest request, CancellationToken cancellationToken)
    {
        var message = new ContactMessage
        {
            Name = request.Name.Trim(),
            Email = request.Email.Trim(),
            Phone = request.Phone,
            Subject = request.Subject.Trim(),
            Message = request.Message.Trim(),
        };

        db.ContactMessages.Add(message);
        await db.SaveChangesAsync(cancellationToken);

        return ToDto(message);
    }

    public async Task<IReadOnlyList<ContactMessageDto>> GetContactMessagesAsync(CancellationToken cancellationToken)
    {
        var messages = await db.ContactMessages.AsNoTracking()
            .OrderByDescending(m => m.CreatedAt)
            .ToListAsync(cancellationToken);

        return messages.Select(ToDto).ToList();
    }

    public async Task<ContactMessageDto> ResolveContactMessageAsync(Guid id, CancellationToken cancellationToken)
    {
        var message = await db.ContactMessages.FirstOrDefaultAsync(m => m.Id == id, cancellationToken)
                       ?? throw new NotFoundException("ContactMessage", id);

        message.IsResolved = true;
        await db.SaveChangesAsync(cancellationToken);

        return ToDto(message);
    }

    public async Task<CateringInquiryDto> SubmitCateringInquiryAsync(SubmitCateringInquiryRequest request, CancellationToken cancellationToken)
    {
        var inquiry = new CateringInquiry
        {
            Name = request.Name.Trim(),
            Phone = request.Phone.Trim(),
            Email = request.Email,
            EventDate = request.EventDate,
            GuestCount = request.GuestCount,
            PackageName = request.PackageName,
            Message = request.Message,
        };

        db.CateringInquiries.Add(inquiry);
        await db.SaveChangesAsync(cancellationToken);

        return ToDto(inquiry);
    }

    public async Task<IReadOnlyList<CateringInquiryDto>> GetCateringInquiriesAsync(CancellationToken cancellationToken)
    {
        var inquiries = await db.CateringInquiries.AsNoTracking()
            .OrderByDescending(i => i.CreatedAt)
            .ToListAsync(cancellationToken);

        return inquiries.Select(ToDto).ToList();
    }

    public async Task<CateringInquiryDto> UpdateCateringInquiryStatusAsync(Guid id, UpdateCateringInquiryStatusRequest request, CancellationToken cancellationToken)
    {
        var inquiry = await db.CateringInquiries.FirstOrDefaultAsync(i => i.Id == id, cancellationToken)
                      ?? throw new NotFoundException("CateringInquiry", id);

        inquiry.Status = request.Status;
        await db.SaveChangesAsync(cancellationToken);

        return ToDto(inquiry);
    }

    private static ContactMessageDto ToDto(ContactMessage m) =>
        new(m.Id, m.Name, m.Email, m.Phone, m.Subject, m.Message, m.IsResolved, m.CreatedAt);

    private static CateringInquiryDto ToDto(CateringInquiry i) =>
        new(i.Id, i.Name, i.Phone, i.Email, i.EventDate, i.GuestCount, i.PackageName, i.Message, i.Status, i.CreatedAt);
}
