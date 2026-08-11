using Ecommerce.Modules.Cart;
using Ecommerce.Modules.Cart.Endpoints;
using Ecommerce.Modules.Cart.Infrastructure;
using Ecommerce.Modules.Catalog;
using Ecommerce.Modules.Catalog.Endpoints;
using Ecommerce.Modules.Catalog.Infrastructure;
using Ecommerce.Modules.Identity;
using Ecommerce.Modules.Identity.Endpoints;
using Ecommerce.Modules.Identity.Infrastructure;
using Ecommerce.Modules.Inventory;
using Ecommerce.Modules.Inventory.Endpoints;
using Ecommerce.Modules.Inventory.Infrastructure;
using Ecommerce.Modules.Orders;
using Ecommerce.Modules.Orders.Endpoints;
using Ecommerce.Modules.Orders.Infrastructure;
using Ecommerce.Shared.Infrastructure.Extensions;
using Ecommerce.Shared.Infrastructure.Options;
using Ecommerce.Shared.Infrastructure.Security;
using Microsoft.AspNetCore.Authorization;
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
    builder.Services.AddSharedCors(builder.Configuration);

    builder.Services.AddAuthorizationBuilder()
        .AddPolicy("AdminOnly", policy => policy.RequireRole("Admin"));

    builder.Services.AddIdentityModule(builder.Configuration);
    builder.Services.AddCatalogModule(builder.Configuration);
    builder.Services.AddInventoryModule(builder.Configuration);
    builder.Services.AddCartModule(builder.Configuration);
    builder.Services.AddOrdersModule(builder.Configuration);

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
    app.UseCors("Default");
    app.UseAuthentication();
    app.UseAuthorization();

    app.MapAuthEndpoints();
    app.MapCategoryEndpoints();
    app.MapProductEndpoints();
    app.MapCartEndpoints();
    app.MapOrderEndpoints();
    app.MapInventoryEndpoints();

    app.MapHealthChecks("/health");

    using (var scope = app.Services.CreateScope())
    {
        var services = scope.ServiceProvider;

        await services.GetRequiredService<IdentityDbContext>().Database.MigrateAsync();
        await services.GetRequiredService<CatalogDbContext>().Database.MigrateAsync();
        await services.GetRequiredService<InventoryDbContext>().Database.MigrateAsync();
        await services.GetRequiredService<CartDbContext>().Database.MigrateAsync();
        await services.GetRequiredService<OrdersDbContext>().Database.MigrateAsync();

        await IdentitySeeder.SeedAsync(
            services.GetRequiredService<IdentityDbContext>(),
            services.GetRequiredService<IPasswordHasher>(),
            services.GetRequiredService<IOptions<AdminSeedOptions>>());

        await CatalogSeeder.SeedAsync(
            services.GetRequiredService<CatalogDbContext>(),
            services.GetRequiredService<InventoryDbContext>());
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
