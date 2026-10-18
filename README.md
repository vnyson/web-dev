# Personal Brand Monorepo

Yarn/Turborepo monorepo containing a shared design system, Astro sites, and a Cloudflare Worker API backed by D1.

Live site: https://vnyson.com

For AI-agent workflow, see [AGENTS.md](AGENTS.md). The maintained documentation index is [docs/README.md](docs/README.md).

## Monorepo structure

- `packages/design-system/` — shared CSS design system (`@vnyson/design-system`).
- `sites/tennis-stringing/` — public Astro site and browser tests.
- `sites/admin/` — Astro admin dashboard.
- `sites/radio/` — partial radio experiments and proposed plans; not currently a complete runnable site.
- `workers/api/` — Cloudflare Worker API.
- `db/migrations/` and `db/seed/` — D1 schema migrations and seed/data utilities.
- `.github/workflows/` — CI, deployment, preview, and publishing automation.

## Package management and setup

Uses Yarn 4 workspaces and Turborepo.

```sh
corepack enable
corepack prepare yarn@4.5.0 --activate
yarn install
```

## Development commands

```sh
yarn build       # Build all workspaces
yarn dev         # Start all configured dev workspaces
yarn start:dev   # Start public site, admin, and API together
yarn setup:local # Apply local site-settings SQL operation
```

The local services run at `http://localhost:8080` (public site),
`http://localhost:4321` (admin), and `http://127.0.0.1:8787` (API). The public
site automatically uses the local API when opened on localhost. The full
historical D1 migration command may fail against an already-seeded local
database; review [database guidance](docs/data/database.md) before migration
operations.

See [development workflows](docs/development/workflows.md) for test commands,
CI coverage, and deployment notes.

## Quality checks

```sh
yarn format:check
yarn lint
yarn build
yarn test --run
yarn test:e2e
```

The current CI workflow runs format check, lint, and build, but does not run the
Vitest or Playwright suites. Root lint globs do not comprehensively cover Astro
or TypeScript files; select relevant tests and workspace builds for changes.

## Design system

The shared CSS package is in `packages/design-system/`. Check all consumers
before changing shared tokens or components. See its [package manifest](packages/design-system/package.json)
and [styles](packages/design-system/css/). Publishing is externally impactful;
inspect `.github/workflows/publish-npm.yml` and obtain explicit authorization
before publishing.

## Deployment

GitHub Actions workflows are configured for Cloudflare Pages and Workers. See
the workflow files under `.github/workflows/` and the [deployment notes](docs/development/workflows.md#ci-and-deployment)
before relying on artifact paths, project settings, or triggering deployments.

## Adding a workspace/site

1. Confirm the framework, workspace scripts, and deployment requirements.
2. Create the workspace manifest and application source/configuration.
3. Add a workspace dependency on `@vnyson/design-system` if needed.
4. Add or update tests and deployment workflow as appropriate.
5. Update [the architecture guide](docs/architecture/overview.md) and relevant operational docs.

## Contributing

Use Conventional Commits (`type(scope): description`) when creating commits.
Before opening a pull request, run the relevant format, lint, build, and test
checks; manually verify affected user-facing behavior. Update canonical
documentation in the same change when architecture, workflows, data contracts,
or significant behavior changes. See [AGENTS.md](AGENTS.md) and
[docs/README.md](docs/README.md) for the maintained workflow and templates.
