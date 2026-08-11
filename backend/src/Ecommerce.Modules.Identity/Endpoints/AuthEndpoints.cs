using Ecommerce.Modules.Identity.Application;
using Ecommerce.Modules.Identity.Contracts;
using Ecommerce.Shared.Kernel;
using FluentValidation;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.AspNetCore.Authorization;

namespace Ecommerce.Modules.Identity.Endpoints;

public static class AuthEndpoints
{
    public static IEndpointRouteBuilder MapAuthEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/auth").WithTags("Auth");

        group.MapPost("/register", async (
            RegisterRequest request,
            IValidator<RegisterRequest> validator,
            IAuthService authService,
            CancellationToken cancellationToken) =>
        {
            await validator.ValidateAndThrowAsync(request, cancellationToken);
            var result = await authService.RegisterAsync(request, cancellationToken);
            return Results.Ok(ApiResponse<AuthResponse>.SuccessResponse(result, "Registration successful."));
        });

        group.MapPost("/login", async (
            LoginRequest request,
            IValidator<LoginRequest> validator,
            IAuthService authService,
            CancellationToken cancellationToken) =>
        {
            await validator.ValidateAndThrowAsync(request, cancellationToken);
            var result = await authService.LoginAsync(request, cancellationToken);
            return Results.Ok(ApiResponse<AuthResponse>.SuccessResponse(result, "Login successful."));
        });

        group.MapPost("/refresh", async (
            RefreshTokenRequest request,
            IValidator<RefreshTokenRequest> validator,
            IAuthService authService,
            CancellationToken cancellationToken) =>
        {
            await validator.ValidateAndThrowAsync(request, cancellationToken);
            var result = await authService.RefreshAsync(request, cancellationToken);
            return Results.Ok(ApiResponse<AuthResponse>.SuccessResponse(result, "Token refreshed."));
        });

        group.MapGet("/me", async (
            ICurrentUser currentUser,
            IAuthService authService,
            CancellationToken cancellationToken) =>
        {
            var result = await authService.GetCurrentUserAsync(currentUser.UserId!.Value, cancellationToken);
            return Results.Ok(ApiResponse<UserDto>.SuccessResponse(result));
        }).RequireAuthorization();

        return app;
    }
}
