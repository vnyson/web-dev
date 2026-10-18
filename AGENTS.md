# Agent guide

This is the tool-agnostic entrypoint for AI coding agents working in this repository. Read relevant docs before changing behavior; treat executable configuration and code as authoritative when documentation disagrees.

## Start here

1. Read [the documentation index](docs/README.md).
2. Read [the architecture overview](docs/architecture/overview.md) and [development workflows](docs/development/workflows.md) for changes that cross workspaces.
3. Read [database guidance](docs/data/database.md) before changing schema, seeds, or D1 operations.
4. For feature requests, refine the request using [the story template](docs/templates/story.md), then make an implementation plan using [the plan template](docs/templates/implementation-plan.md). Keep this lightweight for small fixes; do not create ceremony for trivial changes.
5. When the user asks to capture, refine, or defer work, use the [refined backlog](docs/backlog/README.md) and its card template. When implementing a backlog card, read it fully and re-check its linked code, tests, configuration, dependencies, and current behavior before acting. Update its status and delivery record; the card is not a substitute for current source or tests.
6. Read the nearest source, tests, package manifest, and relevant workflow before proposing edits. Search for existing patterns before introducing a new one.

## Source-of-truth order

When sources disagree, use this order and report meaningful discrepancies:

1. Current runtime source, tests, migrations, package manifests, and executable configuration.
2. CI and deployment workflows for automation/deployment behavior.
3. Current-status documentation under `docs/` and workspace READMEs.
4. Plans, issue notes, exports, and debug logs. These may be proposals or historical context; do not treat them as implemented behavior unless explicitly adopted.

Never infer that a plan has been implemented just because it exists. Label statements as current, proposed, or unresolved where status could be ambiguous.

## Repository map

- `packages/design-system/`: shared CSS package.
- `sites/tennis-stringing/`: public Astro site and browser tests.
- `sites/admin/`: Astro admin application.
- `workers/api/`: Cloudflare Worker API.
- `db/migrations/` and `db/seed/`: D1 migrations and seed/data utilities.
- `sites/radio/`: partial radio experiments and proposals; not currently a complete runnable site. See its [plan index](sites/radio/plans/README.md).

## Working agreements

- Preserve workspace boundaries and established patterns. Avoid unrelated refactors.
- Treat user data, credentials, tokens, and production infrastructure as sensitive. Never print, commit, or invent secrets. Do not run deployment, remote D1 mutation, publishing, destructive, or other externally impactful commands unless the user explicitly requests that operation.
- For database changes, add a migration; do not rewrite an already-applied migration. Review the migration order and local/remote target before running it.
- For API or data-shape changes, inspect both API callers (public site and admin), tests, and relevant schema. For shared design-system changes, inspect all consumers.
- Add or update tests for changed behavior when a suitable test suite exists. Do not claim a check passed unless it was run; distinguish local validation from CI coverage.
- Update canonical docs when workflows, architecture, data contracts, or user-visible behavior change. Keep plans separate from descriptions of implemented behavior.
- Keep backlog cards and the backlog index synchronized when cards are created, reprioritized, started, blocked, completed, or dropped. Do not mark a card Ready until it meets the backlog Definition of Ready; record unresolved decisions instead of inventing answers.
- Before finishing, summarize changed behavior, docs, checks run and any known limitation. Follow repository formatting and Conventional Commit conventions when asked to create a commit.

## Verification

Use the narrowest relevant checks first, then broader checks as appropriate. Root commands are listed in [development workflows](docs/development/workflows.md). The current CI workflow runs formatting, linting, and builds; it does not run unit or browser tests. Root lint globs also do not comprehensively cover Astro or TypeScript files, so choose targeted tests/builds accordingly.
