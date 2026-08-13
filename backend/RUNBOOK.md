# Ya Raheem — Database Backup / Restore / Rollback Runbook

No managed Postgres or cloud backup service is in scope for this pilot — this runbook
**is** the safety net. Practiced once during Week 4 (see Rehearsal Log below).

## Backup

Run on the host running Postgres, using the same connection details as `ConnectionStrings:PostgreSql`.

```bash
pg_dump -h <host> -p 5432 -U postgres -Fc -f "ecommerce_db_$(date +%Y%m%d_%H%M%S).dump" ecommerce_db
```

- `-Fc` = custom format (compressed, supports selective/parallel restore).
- Store the `.dump` file off-host (do not leave it only on the DB server).
- Recommended cadence for pilot: daily, plus one manual dump immediately before any deploy that ships a new migration.

## Restore (full)

```bash
# Create a fresh empty database first if restoring onto a new instance:
createdb -h <host> -U postgres ecommerce_db_restored

pg_restore -h <host> -U postgres -d ecommerce_db_restored --clean --if-exists "ecommerce_db_YYYYMMDD_HHMMSS.dump"
```

Point the app's `ConnectionStrings__PostgreSql` at `ecommerce_db_restored`, confirm the app boots and `/health` returns `Healthy`, then cut over.

## Migration rollback (per-module)

Every schema (`identity`, `catalog`, `inventory`, `cart`, `payments`, `orders`, `leads`, `delivery`) has its own EF Core migration history table, so modules roll back independently:

```bash
cd backend/src/Ecommerce.Database.Migrations
dotnet ef database update <PreviousMigrationName> --context <ModuleDbContext> --startup-project ../Ecommerce.Api
# roll back to empty:
dotnet ef database update 0 --context <ModuleDbContext> --startup-project ../Ecommerce.Api
```

`<ModuleDbContext>` is one of: `IdentityDbContext`, `CatalogDbContext`, `InventoryDbContext`, `CartDbContext`, `PaymentsDbContext`, `OrdersDbContext`, `LeadsDbContext`, `DeliveryDbContext`.

## Rehearsal Log

**2026-08-12** — Rolled `DeliveryDbContext` back to migration `0` (drops `delivery.delivery_partners` and `delivery.order_delivery_assignments`), then reapplied `InitialCreate`. Both directions completed cleanly with no manual intervention; app restart re-seeded the demo delivery partners automatically. This confirms the Down() migrations are correct and the module-per-schema migration history isolation works as designed — a bad deploy touching one module's schema can be rolled back without affecting the others.

Full `pg_dump`/`pg_restore` round-trip was not exercised in this rehearsal (no `psql`/`pg_dump` CLI available in the dev sandbox that generated this doc) — **do this once against the actual pilot Postgres host before go-live**, since the migration-rollback rehearsal above only proves schema rollback, not full data recovery from a dump.
