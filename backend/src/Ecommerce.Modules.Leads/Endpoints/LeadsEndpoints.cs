using Ecommerce.Modules.Leads.Application;
using Ecommerce.Modules.Leads.Contracts;
using Ecommerce.Shared.Kernel;
using FluentValidation;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.AspNetCore.Routing;

namespace Ecommerce.Modules.Leads.Endpoints;

public static class LeadsEndpoints
{
    public static IEndpointRouteBuilder MapLeadsEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapPost("/api/contact", async (
            SubmitContactMessageRequest request,
            IValidator<SubmitContactMessageRequest> validator,
            ILeadsService service,
            CancellationToken cancellationToken) =>
        {
            await validator.ValidateAndThrowAsync(request, cancellationToken);
            var result = await service.SubmitContactMessageAsync(request, cancellationToken);
            return Results.Created($"/api/admin/contact-messages/{result.Id}", ApiResponse<ContactMessageDto>.SuccessResponse(result, "Message sent."));
        }).WithTags("Contact").WithSummary("Submit a contact form message.").RequireRateLimiting("leads");

        app.MapPost("/api/catering/inquiries", async (
            SubmitCateringInquiryRequest request,
            IValidator<SubmitCateringInquiryRequest> validator,
            ILeadsService service,
            CancellationToken cancellationToken) =>
        {
            await validator.ValidateAndThrowAsync(request, cancellationToken);
            var result = await service.SubmitCateringInquiryAsync(request, cancellationToken);
            return Results.Created($"/api/admin/catering-inquiries/{result.Id}", ApiResponse<CateringInquiryDto>.SuccessResponse(result, "Inquiry submitted."));
        }).WithTags("Catering").WithSummary("Submit a catering inquiry / custom quote request.").RequireRateLimiting("leads");

        var adminContact = app.MapGroup("/api/admin/contact-messages").WithTags("Admin").RequireAuthorization("AdminOnly");

        adminContact.MapGet("/", async (ILeadsService service, CancellationToken cancellationToken) =>
            Results.Ok(ApiResponse<IReadOnlyList<ContactMessageDto>>.SuccessResponse(await service.GetContactMessagesAsync(cancellationToken))))
            .WithSummary("List contact form submissions, newest first.");

        adminContact.MapPut("/{id:guid}/resolve", async (Guid id, ILeadsService service, CancellationToken cancellationToken) =>
            Results.Ok(ApiResponse<ContactMessageDto>.SuccessResponse(await service.ResolveContactMessageAsync(id, cancellationToken), "Marked resolved.")));

        var adminCatering = app.MapGroup("/api/admin/catering-inquiries").WithTags("Admin").RequireAuthorization("AdminOnly");

        adminCatering.MapGet("/", async (ILeadsService service, CancellationToken cancellationToken) =>
            Results.Ok(ApiResponse<IReadOnlyList<CateringInquiryDto>>.SuccessResponse(await service.GetCateringInquiriesAsync(cancellationToken))))
            .WithSummary("List catering inquiries, newest first.");

        adminCatering.MapPut("/{id:guid}/status", async (
            Guid id,
            UpdateCateringInquiryStatusRequest request,
            ILeadsService service,
            CancellationToken cancellationToken) =>
            Results.Ok(ApiResponse<CateringInquiryDto>.SuccessResponse(await service.UpdateCateringInquiryStatusAsync(id, request, cancellationToken), "Status updated.")));

        return app;
    }
}
