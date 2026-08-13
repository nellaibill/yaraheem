# Build context is backend/ (see docker-compose.yml at repo root: `context: ./backend`).
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Restore first, on just the project files, so this layer is cached across source-only changes.
# (No .sln file — each project is built directly against Ecommerce.Api.csproj's ProjectReferences.)
COPY src/Ecommerce.Api/*.csproj src/Ecommerce.Api/
COPY src/Ecommerce.Shared.Kernel/*.csproj src/Ecommerce.Shared.Kernel/
COPY src/Ecommerce.Shared.Infrastructure/*.csproj src/Ecommerce.Shared.Infrastructure/
COPY src/Ecommerce.Modules.Audit/*.csproj src/Ecommerce.Modules.Audit/
COPY src/Ecommerce.Modules.Settings/*.csproj src/Ecommerce.Modules.Settings/
COPY src/Ecommerce.Modules.Identity/*.csproj src/Ecommerce.Modules.Identity/
COPY src/Ecommerce.Modules.Catalog/*.csproj src/Ecommerce.Modules.Catalog/
COPY src/Ecommerce.Modules.Cart/*.csproj src/Ecommerce.Modules.Cart/
COPY src/Ecommerce.Modules.Inventory/*.csproj src/Ecommerce.Modules.Inventory/
COPY src/Ecommerce.Modules.Orders/*.csproj src/Ecommerce.Modules.Orders/
COPY src/Ecommerce.Modules.Payments/*.csproj src/Ecommerce.Modules.Payments/
COPY src/Ecommerce.Modules.Coupons/*.csproj src/Ecommerce.Modules.Coupons/
COPY src/Ecommerce.Modules.Leads/*.csproj src/Ecommerce.Modules.Leads/
COPY src/Ecommerce.Modules.Delivery/*.csproj src/Ecommerce.Modules.Delivery/
COPY src/Ecommerce.Database.Migrations/*.csproj src/Ecommerce.Database.Migrations/
RUN dotnet restore src/Ecommerce.Api/Ecommerce.Api.csproj

COPY src/ src/
RUN dotnet publish src/Ecommerce.Api/Ecommerce.Api.csproj -c Release -o /app/publish --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app

# Data Protection key ring and Serilog file sink both need a writable directory that survives
# container restarts (see SettingsModule.AddSettingsModule and appsettings.json's Serilog File
# sink) — created here, owned by the non-root "app" user, before volumes are mounted over them
# so a fresh named volume inherits this ownership on first use.
RUN mkdir -p /app/keys /app/logs && chown -R app:app /app/keys /app/logs

COPY --from=build --chown=app:app /app/publish .

USER app
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "Ecommerce.Api.dll"]
