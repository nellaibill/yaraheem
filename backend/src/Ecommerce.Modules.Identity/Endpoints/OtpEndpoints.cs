using Ecommerce.Modules.Identity.Application;
using Ecommerce.Modules.Identity.Contracts;
using Ecommerce.Shared.Kernel;
using FluentValidation;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace Ecommerce.Modules.Identity.Endpoints;

public static class OtpEndpoints
{
    public static IEndpointRouteBuilder MapOtpEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/auth/otp").WithTags("Auth");

        group.MapPost("/request", async (
            RequestOtpRequest request,
            IValidator<RequestOtpRequest> validator,
            IOtpService otpService,
            CancellationToken cancellationToken) =>
        {
            await validator.ValidateAndThrowAsync(request, cancellationToken);
            var result = await otpService.RequestAsync(request.PhoneNumber, cancellationToken);
            return Results.Ok(ApiResponse<RequestOtpResponse>.SuccessResponse(result, "OTP sent."));
        }).RequireRateLimiting("auth");

        group.MapPost("/verify", async (
            VerifyOtpRequest request,
            IValidator<VerifyOtpRequest> validator,
            IOtpService otpService,
            CancellationToken cancellationToken) =>
        {
            await validator.ValidateAndThrowAsync(request, cancellationToken);
            var result = await otpService.VerifyAsync(request.PhoneNumber, request.Code, cancellationToken);
            return Results.Ok(ApiResponse<VerifyOtpResponse>.SuccessResponse(result));
        }).RequireRateLimiting("auth");

        return app;
    }
}
