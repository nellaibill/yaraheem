using Ecommerce.Modules.Catalog.Application;
using Ecommerce.Modules.Catalog.Contracts;
using FluentValidation;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace Ecommerce.Modules.Catalog.Endpoints;

public static class CategoryEndpoints
{
    public static IEndpointRouteBuilder MapCategoryEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/categories").WithTags("Categories");

        group.MapGet("/", async (ICategoryService service, CancellationToken cancellationToken) =>
            Results.Ok(await service.GetAllAsync(cancellationToken)));

        group.MapGet("/{id:guid}", async (Guid id, ICategoryService service, CancellationToken cancellationToken) =>
            Results.Ok(await service.GetByIdAsync(id, cancellationToken)));

        group.MapPost("/", async (
            CreateCategoryRequest request,
            IValidator<CreateCategoryRequest> validator,
            ICategoryService service,
            CancellationToken cancellationToken) =>
        {
            await validator.ValidateAndThrowAsync(request, cancellationToken);
            var result = await service.CreateAsync(request, cancellationToken);
            return Results.Created($"/api/categories/{result.Id}", result);
        }).RequireAuthorization("AdminOnly");

        group.MapPut("/{id:guid}", async (
            Guid id,
            UpdateCategoryRequest request,
            IValidator<UpdateCategoryRequest> validator,
            ICategoryService service,
            CancellationToken cancellationToken) =>
        {
            await validator.ValidateAndThrowAsync(request, cancellationToken);
            return Results.Ok(await service.UpdateAsync(id, request, cancellationToken));
        }).RequireAuthorization("AdminOnly");

        group.MapDelete("/{id:guid}", async (Guid id, ICategoryService service, CancellationToken cancellationToken) =>
        {
            await service.DeleteAsync(id, cancellationToken);
            return Results.NoContent();
        }).RequireAuthorization("AdminOnly");

        return app;
    }
}
