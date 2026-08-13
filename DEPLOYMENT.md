# Deploying to a Linux server

Full-stack deployment (Postgres + API + frontend) via Docker Compose — the whole app in three
containers, built from source on the server itself. This is separate from the GitHub Pages
deployment described in the root `README.md`, which only ever shipped the old client-only
prototype and doesn't talk to the real backend at all.

## Prerequisites

- A Linux server (any distro) with **Docker Engine** and the **Docker Compose plugin** installed.
  Quick install: `curl -fsSL https://get.docker.com | sh`, then add your user to the `docker`
  group (`sudo usermod -aG docker $USER`, then re-login) so you don't need `sudo` for every command.
- A domain name pointed at the server (an A/AAAA record). Required for TLS — see below.
- Git, to pull the repo onto the server.

## 1. Get the code onto the server

```bash
git clone https://github.com/nellaibill/yaraheem.git
cd yaraheem
```

For updates later, `git pull` from this same directory, then re-run the build step (step 4).

## 2. Configure secrets

```bash
cp .env.example .env
nano .env   # or vim, or whatever's on the box
```

Fill in at minimum: `PUBLIC_ORIGIN` (your domain, `https://...`), `POSTGRES_PASSWORD`,
`JWT_SIGNING_KEY`, `PAYMENTS_WEBHOOK_SECRET`, and `ADMIN_SEED_PASSWORD` (to get an initial admin
login). Generate strong random values:

```bash
openssl rand -base64 48   # JWT_SIGNING_KEY
openssl rand -hex 32      # PAYMENTS_WEBHOOK_SECRET
```

SMS/WhatsApp/Razorpay credentials can be left blank here and set later from
**Admin → Integrations** in the running app instead — see `backend/SECRETS.md`.

`.env` is gitignored — it never leaves this server.

## 3. Put TLS in front of it

The `web` container only speaks plain HTTP on `WEB_PORT` (default `80`). The backend refuses to
start unless `PUBLIC_ORIGIN` (used as its CORS allow-list entry) is `https://`, so you need a TLS
terminator in front before the app will run at all. The simplest option is
[Caddy](https://caddyserver.com/) — it gets and renews a free Let's Encrypt certificate
automatically with zero manual steps once DNS is pointed at the server:

```bash
sudo apt install -y caddy   # or see caddyserver.com/docs/install for other distros
```

`/etc/caddy/Caddyfile`:

```
your-domain.example.com {
    reverse_proxy localhost:80
}
```

```bash
sudo systemctl reload caddy
```

That's it — Caddy handles the certificate and forwards everything to the `web` container on
port 80. (Already running nginx or another reverse proxy on this box? Point it at `localhost:80`
the same way; Cloudflare Tunnel works too — point the tunnel at `localhost:80` and skip Caddy
entirely.)

## 4. Build and start

```bash
docker compose up -d --build
```

First run builds three images (Postgres is pulled, `api` and `web` are built from source) and
starts them. The API automatically applies EF Core migrations and seeds catalog/admin data on
startup — watch it happen with:

```bash
docker compose logs -f api
```

Once you see `Application started. Press Ctrl+C to shut down.`, visit `https://your-domain` —
you should see the storefront. Admin login is at `/admin/login` with the email/password you set
as `ADMIN_SEED_EMAIL`/`ADMIN_SEED_PASSWORD`.

## Updating

```bash
git pull
docker compose up -d --build
```

Compose only rebuilds images whose inputs changed, so this is fast on repeat deploys. New EF
Core migrations (if any shipped in the update) apply automatically on the next `api` container
start — no manual migration step needed.

## Operational notes

- **Data Protection keys** (used to encrypt SMS/WhatsApp/Razorpay overrides set from
  Admin → Integrations) live in the `dataprotection_keys` named volume, not inside the
  container — they survive rebuilds and restarts. Back this volume up along with the database;
  losing it means every credential saved through the admin UI becomes unreadable and has to be
  re-entered (the `Sms:*`/`WhatsApp:*`/`Razorpay:*` values in `.env`, if any, are unaffected).
- **Database backups**: `docker compose exec postgres pg_dump -U postgres ecommerce_db > backup.sql`.
  Automate this with a cron job — nothing here does it for you.
- **Logs**: `docker compose logs -f api` (stdout/stderr, via Serilog's console sink) or
  `docker compose exec api ls /app/logs` (rolling file sink, same `api_logs` volume across
  restarts).
- **Scaling beyond one `api` instance**: don't, not without changes — the Data Protection key
  ring is file-based (fine for one instance, see `SettingsModule.AddSettingsModule`) and nothing
  else in this stack coordinates multiple API replicas.
- To run only Postgres for local (non-Docker) development instead of the full stack, use
  `backend/docker-compose.yml` — see `backend/README.md`.
