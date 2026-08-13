# Secrets

None of these are committed to source control. The app fails fast at startup if a required one is missing or too weak — this is intentional (Week 1 stabilization: previously the JWT signing key shipped as a literal placeholder, and the DB password and admin seed password were committed in plaintext in `appsettings.json`).

| Key | Required | Notes |
|---|---|---|
| `ConnectionStrings:PostgreSql` | Yes | Full Npgsql connection string. App throws at startup if missing. |
| `Jwt:SigningKey` | Yes | Minimum 32 characters. App throws at startup if missing or shorter. Rotating this invalidates every existing access/refresh token — every logged-in session (customer, admin) is forced to re-authenticate. |
| `AdminSeed:Password` | No | If left unset, `IdentitySeeder` skips seeding the admin account and logs a warning, rather than falling back to a hardcoded password. Set it once to seed the initial admin, then it's safe to leave configured or remove — seeding is idempotent (skipped if the account already exists). |
| `Payments:WebhookSecret` | Yes (to receive webhooks) | Shared HMAC-SHA256 secret used to verify `POST /api/payments/webhook` calls. Requests without a valid `X-Webhook-Signature` header are rejected. |
| `Email:SmtpHost` / `Email:SmtpUsername` / `Email:SmtpPassword` | No | Leave unset in dev/pilot — password-reset emails are written to the application log instead of sent (see `LoggingEmailSender`). Set all three (a real SMTP provider — SendGrid, SES, etc.) before go-live, or password reset never reaches a real inbox. |
| `Sms:Msg91ApiKey` / `Sms:Msg91TemplateId` | No | Leave unset in dev/pilot — OTP codes and order-status texts are written to the application log instead of sent (see `Msg91SmsSender`). Set both (a DLT-registered MSG91 template is required for Indian transactional SMS) before go-live, or customers never receive OTPs/notifications by real SMS. Can also be set (or overridden per deployment) from the admin UI — see below. |
| `WhatsApp:TwilioAccountSid` / `WhatsApp:TwilioAuthToken` / `WhatsApp:TwilioFromNumber` | No | Leave unset in dev/pilot — order notifications are written to the application log instead of sent (see `TwilioWhatsAppSender`). Set all three before go-live. `TwilioFromNumber` must be a WhatsApp-enabled Twilio sender (e.g. `whatsapp:+14155238886` for their sandbox, or your approved business number) — production also needs a WhatsApp Business Content Template approved by Meta for messages sent outside an active 24-hour customer session. Can also be set (or overridden per deployment) from the admin UI — see below. |
| `Razorpay:KeyId` / `Razorpay:KeySecret` / `Razorpay:WebhookSecret` | No | Leave unset in dev/pilot — ONLINE checkout falls back to the dummy payment simulator (instant fake "Paid", no real money moves). Set all three before go-live, or customers are never actually charged. `WebhookSecret` is configured separately in the Razorpay Dashboard's webhook settings (not the same as `KeySecret`) for the `payment.captured` event pointed at `POST /api/payments/orders/razorpay/webhook`. Can also be set (or overridden per deployment) from the admin UI — see below. |

## Admin-configurable credentials (SMS / WhatsApp / Razorpay)

The nine keys above for SMS, WhatsApp, and Razorpay don't have to be set as user-secrets/environment
variables at all — they can instead be set from **Admin → Integrations** (`/admin/settings/integrations`)
in the running app. That's the intended path for onboarding a *new customer/deployment* onto this
codebase without touching server config files: an admin logs in, pastes the new customer's MSG91/
Twilio/Razorpay credentials into the form, and it takes effect on the very next SMS/WhatsApp send or
payment attempt — no restart.

How it works: `IIntegrationSettingsStore` (`Ecommerce.Shared.Infrastructure/Settings`) checks a
database table (`settings.integration_settings`, values encrypted at rest via ASP.NET Core Data
Protection) before falling back to the corresponding `Sms:*`/`WhatsApp:*`/`Razorpay:*` config value.
Config values above are therefore just the *initial* defaults — either source works, and a database
override always wins. Values are never returned to the frontend in plaintext, only as a `••••last4`
preview.

**Caveat:** Data Protection persists its encryption key ring to the local filesystem by default. That's
fine for the current single-instance deployment, but means saved overrides become unreadable if that
key ring is lost (e.g. redeploying a container without persistent storage, or scaling to multiple
instances without a shared key ring). Point Data Protection at shared storage (`PersistKeysToDbContext`,
Azure Blob, etc.) in `SettingsModule.AddSettingsModule` before running more than one instance.

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
