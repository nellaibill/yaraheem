using Ecommerce.Modules.Orders.Application;
using Ecommerce.Modules.Orders.Contracts;
using Ecommerce.Shared.Kernel;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace Ecommerce.Modules.Orders.Endpoints;

public static class AdminCustomerEndpoints
{
    public static IEndpointRouteBuilder MapAdminCustomerEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/admin/customers").WithTags("Admin").RequireAuthorization("AdminOnly");

        group.MapGet("/", async (IOrderService service, CancellationToken cancellationToken) =>
        {
            var result = await service.GetCustomerSummariesAsync(cancellationToken);
            return Results.Ok(ApiResponse<IReadOnlyList<CustomerSummaryDto>>.SuccessResponse(result));
        }).WithSummary("List registered customers with order count and lifetime spend, ranked by spend.");

        return app;
    }
}
