# Tennis Admin System

Admin dashboard for tennis stringing services, built with Astro and Tailwind CSS and backed by Cloudflare D1.

For the current workspace map, shared development and testing commands, and D1 safety guidance, see the [repository documentation index](../../docs/README.md), [development workflows](../../docs/development/workflows.md), and [database guide](../../docs/data/database.md). This README provides admin-oriented setup context; verify commands against the current package manifests.

## Prerequisites

- Node.js 22.12+ (the strictest current workspace engine requirement)
- Yarn 4.5.0 via Corepack
- Cloudflare account and credentials only for explicitly authorized remote operations

Install dependencies once from the repository root:

```sh
corepack enable
corepack prepare yarn@4.5.0 --activate
yarn install
```

## Local development

Prefer starting the public site, admin app, and API together from the repository root with `yarn start:dev`. The services are available at `http://localhost:8080`, `http://localhost:4321`, and `http://127.0.0.1:8787`, respectively.

To work on one service, its scripts are declared in its package manifest:

- Admin app: [sites/admin/package.json](package.json) — `yarn dev`, `yarn build`, `yarn preview`.
- Worker API: [workers/api/package.json](../../workers/api/package.json) — `yarn dev`, `yarn deploy`, and D1 scripts.

## Database setup and safety

Read the [database guide](../../docs/data/database.md) before creating a database or applying migrations. Commands targeting remote D1 or creating Cloudflare resources can have external impact; inspect the script and target, and obtain explicit authorization before running them. The root `yarn setup:local` command applies the local site-settings SQL operation.

For migrations, the Worker uses the migration directory configured in [wrangler.toml](../../workers/api/wrangler.toml). The historical migration set may not apply cleanly to an already-seeded local database. Do not modify an already-applied migration; add a new migration and update affected Worker behavior/tests.

## Project structure

- `src/pages/` — Astro admin pages.
- `src/lib/` — client-side API access and application utilities.
- `src/styles/` — app styles.
- `workers/api/` — backend Worker, maintained separately from the admin frontend.
- `db/migrations/` — D1 schema history.

See the [architecture overview](../../docs/architecture/overview.md) for data flow and workspace boundaries.

## Features

- Dashboard for active jobs, inventory, and players.
- Inventory and stringing-job management.
- Player profiles and racket information.
- Site settings and player-facing services.

## Deployment

The repository has GitHub Actions workflows for Pages and Worker deployment. Review [development and deployment workflows](../../docs/development/workflows.md#ci-and-deployment) and the applicable workflow under `.github/workflows/` before relying on deployment behavior or triggering a deployment.
