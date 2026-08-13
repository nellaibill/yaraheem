using Ecommerce.Modules.Coupons.Application;
using Ecommerce.Modules.Coupons.Contracts;
using Ecommerce.Shared.Kernel;
using FluentValidation;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace Ecommerce.Modules.Coupons.Endpoints;

public static class CouponEndpoints
{
    public static IEndpointRouteBuilder MapCouponEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/coupons").WithTags("Coupons").RequireAuthorization();

        group.MapPost("/preview", async (
            ApplyCouponPreviewRequest request,
            IValidator<ApplyCouponPreviewRequest> validator,
            ICurrentUser currentUser,
            ICouponService service,
            CancellationToken cancellationToken) =>
        {
            await validator.ValidateAndThrowAsync(request, cancellationToken);
            var result = await service.PreviewAsync(currentUser.UserId!.Value, request.Code, request.Subtotal, cancellationToken);
            return Results.Ok(ApiResponse<ApplyCouponPreviewResponse>.SuccessResponse(result));
        }).WithSummary("Check whether a coupon code is valid for the given subtotal, without redeeming it.");

        return app;
    }

    public static IEndpointRouteBuilder MapAdminCouponEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/admin/coupons").WithTags("Coupons").RequireAuthorization("AdminOnly");

        group.MapGet("/", async (ICouponService service, CancellationToken cancellationToken) =>
        {
            var result = await service.GetAllAsync(cancellationToken);
            return Results.Ok(ApiResponse<IReadOnlyList<CouponDto>>.SuccessResponse(result));
        });

        group.MapPost("/", async (
            CreateCouponRequest request,
            IValidator<CreateCouponRequest> validator,
            ICouponService service,
            CancellationToken cancellationToken) =>
        {
            await validator.ValidateAndThrowAsync(request, cancellationToken);
            var result = await service.CreateAsync(request, cancellationToken);
            return Results.Created($"/api/admin/coupons/{result.Id}", ApiResponse<CouponDto>.SuccessResponse(result, "Coupon created."));
        });

        group.MapPut("/{id:guid}", async (
            Guid id,
            UpdateCouponRequest request,
            IValidator<UpdateCouponRequest> validator,
            ICouponService service,
            CancellationToken cancellationToken) =>
        {
            await validator.ValidateAndThrowAsync(request, cancellationToken);
            var result = await service.UpdateAsync(id, request, cancellationToken);
            return Results.Ok(ApiResponse<CouponDto>.SuccessResponse(result, "Coupon updated."));
        });

        group.MapDelete("/{id:guid}", async (Guid id, ICouponService service, CancellationToken cancellationToken) =>
        {
            await service.DeleteAsync(id, cancellationToken);
            return Results.NoContent();
        });

        return app;
    }
}
