# Refined feature backlog

This is the maintained queue for ideas and feature work that should be captured for later, refined into actionable outcomes, and pulled by any contributor or AI agent. Each card is a standalone Markdown file in this directory; this page is the navigable index and workflow contract.

## How to use the backlog

- **Capture:** When asked to remember, refine, or defer an idea, create a card from [`_template.md`](_template.md). If information is missing, record the unknowns; do not invent answers.
- **Refine:** Gather relevant codebase context and evidence, clarify user outcome and acceptance criteria, and resolve blocking decisions. Keep early ideas in `Idea` or `Refining` until the Ready checklist is met.
- **Pull:** When asked to work on a card, read the entire card and re-open its linked source, tests, configs, docs, and dependencies. Card context can go stale; runtime source and tests remain authoritative. If the card is ambiguous or materially stale, stop implementation, update/refine the card, and ask for confirmation if a product decision is needed.
- **Deliver:** Move the card to `In progress`; use a lightweight implementation plan from [`../templates/implementation-plan.md`](../templates/implementation-plan.md) when work crosses files/workspaces or has meaningful data, security, rollout, or dependency risks. Keep implementation scope within the card unless the user approves a change.
- **Close:** On completion, update status and date, summarize what was actually delivered, link relevant changes/decisions, and record checks run and deferred items. Do not leave uncompleted acceptance criteria checked. Move `Done` cards into [`archive/`](archive/README.md) and update both indexes. Keep `Dropped` cards in the closed section here unless a future policy says otherwise.

For a one-off request that the user wants implemented now, follow the repository workflow without creating a backlog card unless the user asks to capture it or an existing card is being pulled.

## Card status

Use exactly one status per card:

- `Idea` — captured, not yet refined.
- `Refining` — context or requirements are being clarified.
- `Ready` — meets the Ready checklist; can be selected for implementation.
- `In progress` — actively being implemented.
- `Blocked` — cannot proceed pending a named dependency or decision.
- `Done` — acceptance criteria delivered and verified; retained for traceability.
- `Dropped` — intentionally not pursued; record why and retain for traceability.

Priority is relative to this backlog: `P0` urgent/blocking, `P1` high, `P2` normal, `P3` low. Set priority only when there is enough context; otherwise use `Untriaged`. Priority is not a commitment or delivery date.

## Definition of Ready

A card may be marked `Ready` only when it has:

- A clear user/problem statement and observable desired outcome.
- Testable acceptance criteria, including relevant failure/edge cases.
- Explicit scope and non-goals.
- Affected workspaces/surfaces and links to current evidence (source, tests, manifests/config, migrations, workflows, or existing docs as applicable).
- A short context-gathering checklist for the implementer, identifying what must be re-read or verified when work starts.
- Dependencies and decisions either resolved, or explicitly identified as non-blocking with an owner/next step.
- Relevant security/privacy, accessibility, data/API, compatibility, and operational considerations assessed; mark irrelevant areas N/A with a reason.
- A verification approach and expected documentation updates.

A Ready card defines the problem and outcome, not a mandate to use a specific implementation. Technical proposals belong in evidence-linked notes and may be revised after inspecting current code.

## Index

Create one row per card and update the index in the same change as card creation, status, priority, or title changes. Name each card `BL-####-short-title.md`. IDs are permanent and never reused. Assign the next unused `BL-####` ID by checking existing card files (excluding this README and `_template.md`); resolve concurrent ID collisions before merging.

### Open cards

| ID      | Status   | Priority  | Card                                                                                                        | Updated    |
| ------- | -------- | --------- | ----------------------------------------------------------------------------------------------------------- | ---------- |
| BL-0001 | Refining | Untriaged | [Run automated tests in pull-request CI](BL-0001-automate-tests-in-ci.md)                                   | 2026-10-18 |
| BL-0002 | Refining | Untriaged | [Align public Pages deployment with the Astro build output](BL-0002-align-public-pages-deploy-artifact.md)  | 2026-10-18 |
| BL-0003 | Refining | Untriaged | [Handle inventory deletion when consumption history exists](BL-0003-handle-inventory-delete-foreign-key.md) | 2026-10-18 |
| BL-0005 | Refining | Untriaged | [Make admin management workflows usable on mobile](BL-0005-improve-admin-mobile-usability.md)               | 2026-10-18 |
| BL-0006 | Refining | Untriaged | [Let players correct their own profile name](BL-0006-allow-player-self-service-name-edit.md)                | 2026-10-18 |

### Closed cards

Keep `Dropped` cards linked here for traceability. `Done` cards are moved to the archive; keep their links here so IDs and completion history remain searchable. Move a row from Open to Closed when its status changes.

| ID      | Status | Card                                                                                        | Updated    |
| ------- | ------ | ------------------------------------------------------------------------------------------- | ---------- |
| BL-0004 | Done   | [Keep job editing within the selected job flow](archive/BL-0004-fix-job-edit-navigation.md) | 2026-10-18 |

See the [archive index](archive/README.md) for completed cards.
