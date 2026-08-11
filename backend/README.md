# Ecommerce Backend

Production-ready modular monolith backend for the existing eCommerce frontend. Built with .NET 10, ASP.NET Core Minimal APIs, PostgreSQL, and EF Core (Npgsql). Lives entirely under `backend/` and does not touch the existing frontend.

## Architecture

Clean Architecture / DDD-inspired modular monolith. Each business module (`Identity`, `Catalog`, `Cart`, `Orders`, `Inventory`) is a standalone class library with its own layers:

```
Application/     use-case services, FluentValidation validators
Contracts/       DTOs (request/response records) — the module's public surface
Domain/          entities, enums
Infrastructure/  DbContext, IEntityTypeConfiguration<T> mappings
Endpoints/       Minimal API endpoint mapping extensions
```

`Ecommerce.Api` is the only composition root — it references every module and wires DI, auth, Swagger, Serilog, health checks, and endpoint mapping in `Program.cs`. Modules never reference the Api project. Cross-module calls go through a module's public `I*Service` interface (e.g. `Orders` calls `Cart`'s `ICartService`), never through another module's `DbContext` or `Domain` types directly, except where a direct read via `DbContext` is the pragmatic choice (e.g. `Cart` reading `Catalog`'s `Product` for price snapshots).

Each module owns its own `DbContext` and PostgreSQL schema (`identity`, `catalog`, `cart`, `orders`, `inventory`). Migrations for all five contexts live together in `Ecommerce.Database.Migrations`, organized by module folder, but are generated per-context.

## Database Schema

| Schema | Tables |
|---|---|
| `identity` | users, roles, user_roles, refresh_tokens |
| `catalog` | categories, products, product_images, product_variants |
| `inventory` | inventory_items, inventory_transactions |
| `cart` | carts, cart_items |
| `orders` | orders, order_items, order_status_history, addresses |

- UUID primary keys, `created_at`/`updated_at` timestamps, soft delete (`is_deleted`/`deleted_at`) on `users`, `categories`, `products`.
- snake_case table/column names applied via a shared EF Core convention (`SnakeCaseExtensions`).
- Foreign keys and unique/lookup indexes are defined per entity in `IEntityTypeConfiguration<T>` classes.

## Implemented API

**Auth** — `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/refresh`, `GET /api/auth/me`

**Catalog / Categories** — `GET/POST /api/categories`, `GET /api/categories/tree` (nested, for nav menus), `GET/PUT/DELETE /api/categories/{id}` (write ops require `Admin`)

**Catalog / Products** — `GET /api/products` (pagination, `search`, `categoryId`, `isActive`, `sortBy` in `price|name|created_at`, `sortDescending`), `GET /api/products/featured`, `GET /api/products/slug/{slug}`, `GET/POST/PUT/DELETE /api/products/{id}` (write ops require `Admin`)

**Cart** — `GET /api/cart`, `POST /api/cart/items`, `PUT/DELETE /api/cart/items/{itemId}`, `DELETE /api/cart/clear` (authenticated user; one cart per user, auto-created on first add)

**Orders** — `POST /api/orders/checkout` (creates order from cart, validates + deducts stock, clears cart), `GET /api/orders/my-orders`, `GET /api/orders/{id}`, `PUT /api/orders/{id}/status` (`Admin` only)

**Inventory** — `POST /api/inventory/adjust` (`Admin` only; records a `Purchase`/`Sale`/`Adjustment` transaction, rejects changes that would go negative)

**Ops** — `GET /health` (Postgres health check)

All errors are returned as RFC 7807 `ProblemDetails` via a global `IExceptionHandler`. All successful responses are wrapped as `{ success, message, data }` (`Ecommerce.Shared.Kernel.ApiResponse<T>`); paginated list endpoints nest a `{ items, page, pageSize, totalCount, totalPages }` shape inside `data`. Swagger UI is available at `/swagger` in the `Development` environment, grouped by module tag (Auth/Catalog/Cart/Orders/Inventory), with JWT bearer auth wired into the UI.

## Security

- JWT access tokens (HMAC-SHA256, 15 min default) + rotating refresh tokens (7 day default, single-use — each refresh revokes the old token and issues a new one).
- Passwords hashed with ASP.NET Core's `PasswordHasher<T>` (PBKDF2).
- `Admin` and `Customer` roles seeded on startup; an admin user is seeded from `AdminSeed` configuration.
- CORS policy restricted to `Cors:AllowedOrigins` (falls back to allow-all if left empty — set explicit origins for production).

## Setup

### 1. Start PostgreSQL

```bash
docker compose -f backend/docker-compose.yml up -d
```

### 2. Restore and build

```bash
cd backend
dotnet restore
dotnet build
```

### 3. Apply migrations (optional — the Api also auto-migrates on startup)

```bash
dotnet ef database update --project src/Ecommerce.Database.Migrations --startup-project src/Ecommerce.Api --context IdentityDbContext
dotnet ef database update --project src/Ecommerce.Database.Migrations --startup-project src/Ecommerce.Api --context CatalogDbContext
dotnet ef database update --project src/Ecommerce.Database.Migrations --startup-project src/Ecommerce.Api --context InventoryDbContext
dotnet ef database update --project src/Ecommerce.Database.Migrations --startup-project src/Ecommerce.Api --context CartDbContext
dotnet ef database update --project src/Ecommerce.Database.Migrations --startup-project src/Ecommerce.Api --context OrdersDbContext
```

### 4. Run the API

```bash
dotnet run --project src/Ecommerce.Api
```

Swagger UI: `https://localhost:<port>/swagger`. Seeded admin login: `admin@ecommerce.local` / `Admin@12345` (override via the `AdminSeed` config section before first run in a real environment). On first run, 3 demo categories (Electronics, Fashion, Home & Kitchen) and 6 demo products with stock are also seeded.

### Generating new migrations after model changes

```bash
dotnet ef migrations add <MigrationName> \
  --project src/Ecommerce.Database.Migrations \
  --startup-project src/Ecommerce.Api \
  --context <IdentityDbContext|CatalogDbContext|InventoryDbContext|CartDbContext|OrdersDbContext> \
  --output-dir Migrations/<Identity|Catalog|Inventory|Cart|Orders>
```

### Run tests

```bash
dotnet test
```

## Configuration

Connection string, JWT signing key, CORS origins, and admin seed credentials are all in `src/Ecommerce.Api/appsettings.json` — override via `appsettings.Development.json`, environment variables, or user secrets. **Change `Jwt:SigningKey` and `AdminSeed:Password` before deploying anywhere real.**

## Future Enhancements

Payments integration, coupons/discounts, wishlist, order/shipment notifications, product reviews & ratings, multi-address book per user (currently a shipping address is captured per-order), inventory deduction/reservation on order placement, admin dashboard analytics, full-text product search, rate limiting.
