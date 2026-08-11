using Ecommerce.Modules.Catalog.Application;
using Ecommerce.Modules.Catalog.Contracts;
using Ecommerce.Shared.Kernel;
using FluentValidation;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace Ecommerce.Modules.Catalog.Endpoints;

public static class CategoryEndpoints
{
    public static IEndpointRouteBuilder MapCategoryEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/categories").WithTags("Catalog");

        group.MapGet("/", async (ICategoryService service, CancellationToken cancellationToken) =>
            Results.Ok(ApiResponse<IReadOnlyList<CategoryDto>>.SuccessResponse(await service.GetAllAsync(cancellationToken))));

        group.MapGet("/tree", async (ICategoryService service, CancellationToken cancellationToken) =>
            Results.Ok(ApiResponse<IReadOnlyList<CategoryTreeNode>>.SuccessResponse(await service.GetTreeAsync(cancellationToken))))
            .WithSummary("Hierarchical category tree for navigation menus.");

        group.MapGet("/{id:guid}", async (Guid id, ICategoryService service, CancellationToken cancellationToken) =>
            Results.Ok(ApiResponse<CategoryDto>.SuccessResponse(await service.GetByIdAsync(id, cancellationToken))));

        group.MapPost("/", async (
            CreateCategoryRequest request,
            IValidator<CreateCategoryRequest> validator,
            ICategoryService service,
            CancellationToken cancellationToken) =>
        {
            await validator.ValidateAndThrowAsync(request, cancellationToken);
            var result = await service.CreateAsync(request, cancellationToken);
            return Results.Created($"/api/categories/{result.Id}", ApiResponse<CategoryDto>.SuccessResponse(result, "Category created."));
        }).RequireAuthorization("AdminOnly");

        group.MapPut("/{id:guid}", async (
            Guid id,
            UpdateCategoryRequest request,
            IValidator<UpdateCategoryRequest> validator,
            ICategoryService service,
            CancellationToken cancellationToken) =>
        {
            await validator.ValidateAndThrowAsync(request, cancellationToken);
            var result = await service.UpdateAsync(id, request, cancellationToken);
            return Results.Ok(ApiResponse<CategoryDto>.SuccessResponse(result, "Category updated."));
        }).RequireAuthorization("AdminOnly");

        group.MapDelete("/{id:guid}", async (Guid id, ICategoryService service, CancellationToken cancellationToken) =>
        {
            await service.DeleteAsync(id, cancellationToken);
            return Results.Ok(ApiResponse<object?>.SuccessResponse(null, "Category deleted."));
        }).RequireAuthorization("AdminOnly");

        return app;
    }
}
