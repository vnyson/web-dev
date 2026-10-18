# Database and D1 guide

## Sources of truth

- [Root migrations](../../db/migrations/) define the tracked D1 schema changes; Wrangler points to this directory in [workers/api/wrangler.toml](../../workers/api/wrangler.toml).
- Worker source and tests define current query behavior. Inspect both before changing schema.
- [Seed utilities](../../db/seed/) and exports provide development/import data; they do not replace migrations or define the schema.
- There is also a radio migration under `db/migrations/radio/`. It is outside the configured root migrations directory; do not assume Wrangler applies it. Resolve migration strategy before operationalizing radio storage.

## Schema change workflow

1. Inspect existing migrations, migration metadata/sequence, Worker queries, and tests.
2. Add a new migration for a schema change. Never edit an already-applied migration to change production history.
3. Update Worker logic and tests in the same change; update API/UI data-contract docs if the contract changed.
4. Review the exact Wrangler command and target. Local and remote operations are different. Remote D1 writes, deployment, destructive changes, and migrations require explicit user authorization.
5. Validate locally where safe and report the database target and checks performed. Do not claim a migration ran unless execution confirmed it.

Root scripts include `yarn setup:local`, which applies the site-settings SQL file locally, and workspace scripts for local/remote migrations. The full historical migration set may not apply cleanly to an already-seeded local database; inspect current state and migration history before running. Never infer that a command named `d1:migrate` is remote: read its script first.

## Seed data

Review generated SQL and source data before executing it, especially because exports may contain personal information. Do not include real customer data in docs, prompts, test fixtures, or logs. Prefer anonymized fixtures for tests. Use local databases for development unless remote access is explicitly required and authorized.
