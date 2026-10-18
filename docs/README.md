# Project documentation

This directory is the canonical home for maintained, cross-workspace project guidance. Keep docs concise, link to implementation/configuration instead of copying it, and update affected docs in the same change as behavior or workflow changes.

## Current documentation

- [Architecture overview](architecture/overview.md) — workspace map, runtime boundaries, and data flow.
- [Development workflows](development/workflows.md) — setup, commands, verification, CI, and deployment boundaries.
- [Database guide](data/database.md) — migration and seed sources, safe D1 practices.
- [Feature story template](templates/story.md) — consistent request refinement and acceptance criteria.
- [Implementation plan template](templates/implementation-plan.md) — scoped, verifiable delivery plans.
- [Refined feature backlog](backlog/README.md) — durable, indexed cards with a readiness and pickup workflow.
- [Decision records](decisions/README.md) — when and how to capture durable decisions.
- [Radio plans index](../sites/radio/plans/README.md) — legacy proposals, not committed roadmap.

The repository-wide AI-agent entrypoint is [AGENTS.md](../AGENTS.md). Product-specific operational notes may remain in workspace READMEs, but should link back here rather than redefine shared workflows.

## Status and maintenance

Use **Current** for behavior verified against the repository, **Proposed** for an unadopted design, and **Unresolved** for a decision that needs confirmation. A plan is not a statement of current behavior. Prefer links to source files, tests, migrations, manifests, and workflows as evidence.

When a change affects architecture, setup, commands, data contracts, migrations, testing, deployment, or significant user behavior, update the relevant guide and templates/index as needed in the same change. Remove or correct stale statements rather than appending contradictory notes. Add a review date only to plans/decision records whose status can become stale; routine evergreen guides need no artificial date.
