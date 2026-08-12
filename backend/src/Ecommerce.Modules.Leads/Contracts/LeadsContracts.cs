using Ecommerce.Modules.Leads.Domain;

namespace Ecommerce.Modules.Leads.Contracts;

public sealed record SubmitContactMessageRequest(string Name, string Email, string? Phone, string Subject, string Message);

public sealed record ContactMessageDto(
    Guid Id, string Name, string Email, string? Phone, string Subject, string Message, bool IsResolved, DateTimeOffset CreatedAt);

public sealed record SubmitCateringInquiryRequest(
    string Name, string Phone, string? Email, DateOnly? EventDate, int? GuestCount, string? PackageName, string? Message);

public sealed record CateringInquiryDto(
    Guid Id, string Name, string Phone, string? Email, DateOnly? EventDate, int? GuestCount,
    string? PackageName, string? Message, CateringInquiryStatus Status, DateTimeOffset CreatedAt);

public sealed record UpdateCateringInquiryStatusRequest(CateringInquiryStatus Status);
