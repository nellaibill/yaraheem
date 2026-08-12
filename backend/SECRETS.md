# Secrets

None of these are committed to source control. The app fails fast at startup if a required one is missing or too weak — this is intentional (Week 1 stabilization: previously the JWT signing key shipped as a literal placeholder, and the DB password and admin seed password were committed in plaintext in `appsettings.json`).

| Key | Required | Notes |
|---|---|---|
| `ConnectionStrings:PostgreSql` | Yes | Full Npgsql connection string. App throws at startup if missing. |
| `Jwt:SigningKey` | Yes | Minimum 32 characters. App throws at startup if missing or shorter. Rotating this invalidates every existing access/refresh token — every logged-in session (customer, admin) is forced to re-authenticate. |
| `AdminSeed:Password` | No | If left unset, `IdentitySeeder` skips seeding the admin account and logs a warning, rather than falling back to a hardcoded password. Set it once to seed the initial admin, then it's safe to leave configured or remove — seeding is idempotent (skipped if the account already exists). |
| `Payments:WebhookSecret` | Yes (to receive webhooks) | Shared HMAC-SHA256 secret used to verify `POST /api/payments/webhook` calls. Requests without a valid `X-Webhook-Signature` header are rejected. |

## Local development

Use [`dotnet user-secrets`](https://learn.microsoft.com/aspnet/core/security/app-secrets) from `backend/src/Ecommerce.Api` — these are stored outside the repo (in your user profile), never committed:

```bash
cd backend/src/Ecommerce.Api
dotnet user-secrets set "ConnectionStrings:PostgreSql" "Host=localhost;Port=5432;Database=ecommerce_db;Username=postgres;Password=<your-local-password>"
dotnet user-secrets set "Jwt:SigningKey" "<32+ random characters>"
dotnet user-secrets set "AdminSeed:Password" "<a password only you use locally>"
dotnet user-secrets set "Payments:WebhookSecret" "<random hex/base64 string>"
```

Generate random values with `openssl rand -base64 48` (signing key) or `openssl rand -hex 32` (webhook secret) — don't reuse the same value across keys, and don't reuse whatever's shown in any example above.

## Other environments

Supply the same keys as environment variables, using `__` (double underscore) in place of `:`:

```
ConnectionStrings__PostgreSql
Jwt__SigningKey
AdminSeed__Password
Payments__WebhookSecret
```

ASP.NET Core's default configuration chain already reads environment variables after `appsettings.json`, so no code changes are needed to pick these up — just set them wherever the app actually runs.
