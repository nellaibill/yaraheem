using Ecommerce.Modules.Delivery.Application;
using Ecommerce.Modules.Delivery.Contracts;
using Ecommerce.Shared.Kernel;
using FluentValidation;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace Ecommerce.Modules.Delivery.Endpoints;

public static class AdminDeliveryPartnerEndpoints
{
    public static IEndpointRouteBuilder MapAdminDeliveryPartnerEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/admin/delivery-partners").WithTags("Admin").RequireAuthorization("AdminOnly");

        group.MapGet("/", async (IDeliveryService service, CancellationToken cancellationToken) =>
            Results.Ok(ApiResponse<IReadOnlyList<DeliveryPartnerDto>>.SuccessResponse(await service.GetPartnersAsync(cancellationToken))))
            .WithSummary("List delivery partners.");

        group.MapPost("/", async (
            CreateDeliveryPartnerRequest request,
            IValidator<CreateDeliveryPartnerRequest> validator,
            IDeliveryService service,
            CancellationToken cancellationToken) =>
        {
            await validator.ValidateAndThrowAsync(request, cancellationToken);
            var result = await service.CreatePartnerAsync(request, cancellationToken);
            return Results.Created($"/api/admin/delivery-partners/{result.Id}", ApiResponse<DeliveryPartnerDto>.SuccessResponse(result, "Delivery partner created."));
        }).WithSummary("Create a delivery partner (creates a linked login account).");

        group.MapPut("/{id:guid}", async (
            Guid id,
            UpdateDeliveryPartnerRequest request,
            IValidator<UpdateDeliveryPartnerRequest> validator,
            IDeliveryService service,
            CancellationToken cancellationToken) =>
        {
            await validator.ValidateAndThrowAsync(request, cancellationToken);
            var result = await service.UpdatePartnerAsync(id, request, cancellationToken);
            return Results.Ok(ApiResponse<DeliveryPartnerDto>.SuccessResponse(result, "Delivery partner updated."));
        }).WithSummary("Update a delivery partner's details/status.");

        return app;
    }
}
