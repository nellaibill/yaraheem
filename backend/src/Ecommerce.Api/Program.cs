using Ecommerce.Api.Endpoints;
using Ecommerce.Modules.Audit;
using Ecommerce.Modules.Audit.Endpoints;
using Ecommerce.Modules.Audit.Infrastructure;
using Ecommerce.Modules.Cart;
using Ecommerce.Modules.Coupons;
using Ecommerce.Modules.Coupons.Endpoints;
using Ecommerce.Modules.Coupons.Infrastructure;
using Ecommerce.Modules.Cart.Endpoints;
using Ecommerce.Modules.Cart.Infrastructure;
using Ecommerce.Modules.Catalog;
using Ecommerce.Modules.Catalog.Endpoints;
using Ecommerce.Modules.Catalog.Infrastructure;
using Ecommerce.Modules.Delivery;
using Ecommerce.Modules.Delivery.Endpoints;
using Ecommerce.Modules.Delivery.Infrastructure;
using Ecommerce.Modules.DineIn;
using Ecommerce.Modules.DineIn.Endpoints;
using Ecommerce.Modules.DineIn.Infrastructure;
using Ecommerce.Modules.Identity;
using Ecommerce.Modules.Identity.Endpoints;
using Ecommerce.Modules.Identity.Infrastructure;
using Ecommerce.Modules.Inventory;
using Ecommerce.Modules.Inventory.Endpoints;
using Ecommerce.Modules.Inventory.Infrastructure;
using Ecommerce.Modules.Leads;
using Ecommerce.Modules.Leads.Endpoints;
using Ecommerce.Modules.Leads.Infrastructure;
using Ecommerce.Modules.Orders;
using Ecommerce.Modules.Orders.Endpoints;
using Ecommerce.Modules.Orders.Infrastructure;
using Ecommerce.Modules.Payments;
using Ecommerce.Modules.Payments.Endpoints;
using Ecommerce.Modules.Payments.Infrastructure;
using Ecommerce.Modules.Settings;
using Ecommerce.Modules.Settings.Endpoints;
using Ecommerce.Modules.Settings.Infrastructure;
using System.Threading.RateLimiting;
using Ecommerce.Shared.Infrastructure.Extensions;
using Ecommerce.Shared.Infrastructure.Options;
using Ecommerce.Shared.Infrastructure.Security;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Options;
using Microsoft.OpenApi;
using Serilog;

Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()
    .CreateBootstrapLogger();

try
{
    var builder = WebApplication.CreateBuilder(args);

    builder.Host.UseSerilog((context, services, configuration) => configuration
        .ReadFrom.Configuration(context.Configuration)
        .ReadFrom.Services(services)
        .Enrich.FromLogContext());

    builder.Services.AddSharedInfrastructure(builder.Configuration);
    builder.Services.AddSharedCors(builder.Configuration, builder.Environment);

    // Per-IP throttling on auth endpoints (brute-force login/register/refresh) and the
    // payment webhook. Fixed-window, no queueing — a throttled caller gets an immediate 429.
    builder.Services.AddRateLimiter(options =>
    {
        options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;

        options.AddPolicy("auth", httpContext => RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            factory: _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 10,
                Window = TimeSpan.FromMinutes(1),
                QueueLimit = 0,
            }));

        options.AddPolicy("webhook", httpContext => RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            factory: _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 30,
                Window = TimeSpan.FromMinutes(1),
                QueueLimit = 0,
            }));

        options.AddPolicy("leads", httpContext => RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            factory: _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 10,
                Window = TimeSpan.FromMinutes(1),
                QueueLimit = 0,
            }));
    });

    builder.Services.AddAuthorizationBuilder()
        .AddPolicy("AdminOnly", policy => policy.RequireRole("Admin"))
        .AddPolicy("DeliveryOnly", policy => policy.RequireRole("DeliveryPartner"))
        .AddPolicy("DineInStaff", policy => policy.RequireRole("Admin", "Waiter"))
        .AddPolicy("DineInKitchen", policy => policy.RequireRole("Admin", "Kitchen"));

    builder.Services.AddAuditModule(builder.Configuration);
    builder.Services.AddSettingsModule(builder.Configuration);
    builder.Services.AddIdentityModule(builder.Configuration);
    builder.Services.AddCatalogModule(builder.Configuration);
    builder.Services.AddInventoryModule(builder.Configuration);
    builder.Services.AddCartModule(builder.Configuration);
    builder.Services.AddCouponsModule(builder.Configuration);
    builder.Services.AddPaymentsModule(builder.Configuration);
    builder.Services.AddOrdersModule(builder.Configuration);
    builder.Services.AddLeadsModule(builder.Configuration);
    builder.Services.AddDeliveryModule(builder.Configuration);
    builder.Services.AddDineInModule(builder.Configuration);

    var connectionString = builder.Configuration.GetConnectionString("PostgreSql")
                            ?? throw new InvalidOperationException("Connection string 'PostgreSql' is not configured.");

    builder.Services.AddHealthChecks()
        .AddNpgSql(connectionString, name: "postgresql");

    builder.Services.AddEndpointsApiExplorer();
    builder.Services.AddSwaggerGen(options =>
    {
        options.SwaggerDoc("v1", new OpenApiInfo { Title = "Ecommerce API", Version = "v1" });

        options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
        {
            Name = "Authorization",
            Type = SecuritySchemeType.Http,
            Scheme = "Bearer",
            BearerFormat = "JWT",
            In = ParameterLocation.Header,
            Description = "Enter a valid JWT access token.",
        });

        options.AddSecurityRequirement(document => new OpenApiSecurityRequirement
        {
            { new OpenApiSecuritySchemeReference("Bearer", document, null), [] },
        });
    });

    var app = builder.Build();

    app.UseExceptionHandler();
    app.UseSerilogRequestLogging();

    if (app.Environment.IsDevelopment())
    {
        app.UseSwagger();
        app.UseSwaggerUI();
    }

    app.UseHttpsRedirection();
    app.UseStaticFiles();
    app.UseCors("Default");
    app.UseAuthentication();
    app.UseAuthorization();
    app.UseRateLimiter();

    app.MapAuthEndpoints();
    app.MapOtpEndpoints();
    app.MapCategoryEndpoints();
    app.MapProductEndpoints();
    app.MapAdminProductImageEndpoints();
    app.MapAdminProductVariantEndpoints();
    app.MapCartEndpoints();
    app.MapOrderEndpoints();
    app.MapAdminOrderEndpoints();
    app.MapAdminCustomerEndpoints();
    app.MapInventoryEndpoints();
    app.MapAdminInventoryEndpoints();
    app.MapPaymentEndpoints();
    app.MapPaymentOrderEndpoints();
    app.MapLeadsEndpoints();
    app.MapAdminDeliveryPartnerEndpoints();
    app.MapAdminDeliveryAssignmentEndpoints();
    app.MapDeliveryEndpoints();
    app.MapAdminAuditEndpoints();
    app.MapCouponEndpoints();
    app.MapAdminCouponEndpoints();
    app.MapAdminIntegrationSettingsEndpoints();
    app.MapDineInStaffEndpoints();
    app.MapDineInKitchenEndpoints();
    app.MapDineInPaymentEndpoints();
    app.MapAdminDiningTableEndpoints();
    app.MapDemoDataEndpoints();

    app.MapHealthChecks("/health");

    using (var scope = app.Services.CreateScope())
    {
        var services = scope.ServiceProvider;

        await services.GetRequiredService<AuditDbContext>().Database.MigrateAsync();
        await services.GetRequiredService<SettingsDbContext>().Database.MigrateAsync();
        await services.GetRequiredService<IdentityDbContext>().Database.MigrateAsync();
        await services.GetRequiredService<CatalogDbContext>().Database.MigrateAsync();
        await services.GetRequiredService<InventoryDbContext>().Database.MigrateAsync();
        await services.GetRequiredService<CartDbContext>().Database.MigrateAsync();
        await services.GetRequiredService<CouponsDbContext>().Database.MigrateAsync();
        await services.GetRequiredService<PaymentsDbContext>().Database.MigrateAsync();
        await services.GetRequiredService<OrdersDbContext>().Database.MigrateAsync();
        await services.GetRequiredService<LeadsDbContext>().Database.MigrateAsync();
        await services.GetRequiredService<DeliveryDbContext>().Database.MigrateAsync();
        await services.GetRequiredService<DineInDbContext>().Database.MigrateAsync();

        await IdentitySeeder.SeedAsync(
            services.GetRequiredService<IdentityDbContext>(),
            services.GetRequiredService<IPasswordHasher>(),
            services.GetRequiredService<IOptions<AdminSeedOptions>>(),
            app.Logger);

        await CatalogSeeder.SeedAsync(
            services.GetRequiredService<CatalogDbContext>(),
            services.GetRequiredService<InventoryDbContext>());

        await OrdersSeeder.SeedAsync(
            services.GetRequiredService<OrdersDbContext>(),
            services.GetRequiredService<IdentityDbContext>(),
            services.GetRequiredService<CatalogDbContext>(),
            services.GetRequiredService<PaymentsDbContext>());

        await CouponsSeeder.SeedAsync(services.GetRequiredService<CouponsDbContext>());

        await DeliverySeeder.SeedAsync(
            services.GetRequiredService<IdentityDbContext>(),
            services.GetRequiredService<DeliveryDbContext>(),
            services.GetRequiredService<IPasswordHasher>(),
            app.Logger);

        await DineInSeeder.SeedAsync(
            services.GetRequiredService<IdentityDbContext>(),
            services.GetRequiredService<DineInDbContext>(),
            services.GetRequiredService<IPasswordHasher>(),
            app.Logger);

        if (app.Environment.IsDevelopment())
        {
            await CatalogAssetAuditor.AuditAsync(services.GetRequiredService<CatalogDbContext>(), app.Logger);
        }
    }

    app.Run();
}
catch (Exception ex) when (ex is not HostAbortedException)
{
    Log.Fatal(ex, "Application terminated unexpectedly");
}
finally
{
    Log.CloseAndFlush();
}
