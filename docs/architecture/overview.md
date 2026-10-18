# Architecture overview

**Status:** Current implementation as observed in the repository. Verify against code/config when making changes.

## Workspaces

- **Shared design system:** CSS tokens, base styles, and reusable components consumed by sites. See the [package manifest](../../packages/design-system/package.json) and [CSS](../../packages/design-system/css/).
- **Public tennis site:** Astro public site and player-facing pages; calls the API from browser-side utilities. See the [package manifest](../../sites/tennis-stringing/package.json), [source](../../sites/tennis-stringing/src/), and [API client](../../sites/tennis-stringing/src/lib/api.ts).
- **Admin:** Astro dashboard for managing players, stringing, inventory, settings, and related workflows. See the [package manifest](../../sites/admin/package.json), [source](../../sites/admin/src/), and [API client](../../sites/admin/src/lib/api.ts).
- **Worker API:** Cloudflare Worker request routing and business logic, backed by D1. See the [package manifest](../../workers/api/package.json), [Worker entrypoint](../../workers/api/src/index.ts), and [Wrangler config](../../workers/api/wrangler.toml).
- **Database:** D1 schema migrations plus seed/data tooling. See [migrations](../../db/migrations/) and [seed utilities](../../db/seed/).
- **Radio experiments:** Partial utilities, data, and proposed plans; not a complete runnable site or confirmed product roadmap. See the [radio plan index](../../sites/radio/plans/README.md) and [radio Worker module](../../workers/api/src/radio.ts).

The root [package manifest](../../package.json) declares Yarn workspaces for `packages/*`, `sites/*`, and `workers/*`; [Turbo configuration](../../turbo.json) coordinates scripts. A directory under `sites/` is not necessarily a configured workspace: check for its manifest and app entrypoints.

## Runtime flow

- The public tennis Astro site and the admin Astro app are separate frontends. Their API client modules select the local Worker URL on localhost and otherwise use the deployed Worker URL.
- The frontend clients send HTTP requests to `workers/api`. The default Worker fetch handler in `src/index.ts` handles CORS/preflight, OAuth routes, and dispatches supported API paths to handlers.
- Worker handlers query or mutate the D1 database through the `DB` binding configured in [wrangler.toml](../../workers/api/wrangler.toml).
- Database schema changes are represented by SQL files in [db/migrations](../../db/migrations), with the migrations directory configured in Wrangler. Seed scripts and data exports are not schema definitions.

Follow concrete call paths and tests before changing a contract. The Worker has a separate radio module, but verify routing in the default fetch handler before assuming its endpoints are reachable. Current source does not establish the radio utilities/plans as a complete active application.

## Change-impact checklist

- API response/request changes: inspect both frontend API clients, the relevant UI, Worker route/handler, and tests.
- Database changes: inspect all relevant queries and migration history; use a new migration for schema changes.
- Shared CSS changes: inspect both Astro sites and any other consumers.
- Build/deploy changes: inspect workspace scripts, Turbo outputs, and the matching GitHub Actions workflow.
- Radio work: first clarify whether the request is implementation or proposal work; do not silently treat archived plans as adopted requirements.
