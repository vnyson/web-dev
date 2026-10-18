# BL-0003: Handle inventory deletion when consumption history exists

**Status:** Done
**Priority:** Untriaged
**Owner:** Unassigned
**Created:** 2026-10-18
**Updated:** 2026-10-18
**Labels:** bug, admin, inventory, api, database

## Problem and desired outcome

- **Who is affected?** Admin users managing inventory and the staff relying on accurate inventory and stringing history.
- **Problem/evidence:** The reporter saw an internal-server error when deleting some inventory items: `D1_ERROR: FOREIGN KEY constraint failed` (`SQLITE_CONSTRAINT_FOREIGNKEY`). The original inventory delete handler attempted to delete the row directly even when [consumption history](../../../db/migrations/0006_inventory_consumption.sql) referenced it.
- **Desired outcome:** Admins receive a predictable, actionable outcome when deleting inventory, and historical consumption data is not silently lost or made misleading.

## User story

As an **admin user**, I want **inventory deletion to handle items referenced by stringing consumption history**, so that **I can manage inventory without unexplained server errors or loss of historical records**.

## Acceptance criteria

- [x] Given an inventory item with no consumption references, when an authorized admin deletes it, then deletion succeeds and the UI reflects its removal.
- [x] Given an item referenced by consumption history, when an admin attempts deletion, then deletion is blocked and the user receives a clear explanation rather than an unexplained internal-server error.
- [x] Given deletion cannot proceed, then the existing item and its historical records remain consistent and the user is told to retain the item because history references it.
- [x] Tests cover successful deletion and the referenced-item case, including the selected persistence behavior.

## Scope

- **In scope:** Preserve consumption history by blocking hard deletion of referenced inventory items; return useful API/UI feedback; cover referenced and unreferenced deletion with tests.
- **Out of scope:** Rewriting past consumption history or changing unrelated inventory CRUD behavior.
- **Affected workspaces/surfaces:** Worker inventory handler, D1 inventory-consumption relationship, admin API client, inventory page and tests.

## Context and evidence

- **Current behavior/evidence:** The [inventory delete handler](../../../workers/api/src/index.ts) checks consumption references first. Referenced items receive HTTP 409; the admin API client and [inventory page](../../../sites/admin/src/pages/inventory.astro) display the safe, actionable message. Foreign-key race failures are translated to the same conflict response.
- **Relevant source, tests, configs, migrations, workflows, docs:** [Worker API tests](../../../workers/api/src/__tests__/index.test.ts), [admin API client](../../../sites/admin/src/lib/api.ts), [admin API tests](../../../sites/admin/src/__tests__/api.test.ts), [inventory page](../../../sites/admin/src/pages/inventory.astro), and [database guidance](../../data/database.md#inventory-consumption-history).
- **Related cards/decisions/issues:** None known.

## Pickup context checklist

- [x] Re-read the current inventory DELETE handler and UI/API delete flow, including error presentation.
- [x] Re-read inventory-consumption creation and stringing-job deletion logic; the consumption FK references inventory and history must remain intact.
- [x] Inspect the current schema and migration history. No schema change is needed for the conservative prevent-delete policy.
- [x] Verify the Worker DELETE test setup; requests must include an admin Authorization header to reach the protected delete handler.
- [x] Preserve the referenced inventory row and all consumption history; hard deletion is blocked when history exists.

## Dependencies and decisions

- **Dependencies:** Current inventory-consumption data contract and D1 schema.
- **Blocking decisions:** None for this implementation. Chosen conservative behavior: prevent hard deletion with a clear explanation when consumption history references the item. Archiving/soft-deletion may be considered separately. Do not cascade-delete history.
- **Assumptions to verify:** No remote database was inspected. The handler blocks known consumption references and safely maps a concurrent foreign-key failure; unrelated database failures remain server errors.

## Quality, risks, and verification

- **Accessibility/responsive:** Ensure any confirmation/error feedback is perceivable and usable with keyboard and assistive technology.
- **Security/privacy/data:** Preserve historical records and avoid exposing raw internal SQL details to end users.
- **Compatibility/performance/operations:** If schema changes are needed, add a new migration; do not rewrite applied migrations. Do not run remote D1 operations without explicit authorization.
- **Risks/mitigations:** Hard deletion remains unavailable for items with history; this deliberately preserves auditable consumption records. A future archive/soft-delete workflow can address inventory cleanup without breaking historical references.
- **Verification:** Worker tests cover authorized deletion with and without references, including a foreign-key race; admin API tests cover conflict-message surfacing. Admin build and focused tests passed. No migration or remote D1 operation was performed.
- **Documentation updates:** Updated [database guidance](../../data/database.md#inventory-consumption-history) with the deletion/history contract.

## Delivery record

- **Implemented:** Hard deletion succeeds for unreferenced items. If consumption history references an item, the API returns HTTP 409 with a stable error code and user-safe message; a foreign-key race is also translated to HTTP 409. The admin displays that message and retains the item.
- **Changed areas/decision links:** [Worker handler](../../../workers/api/src/index.ts), [Worker tests](../../../workers/api/src/__tests__/index.test.ts), [admin API client](../../../sites/admin/src/lib/api.ts), [inventory page](../../../sites/admin/src/pages/inventory.astro), [admin API tests](../../../sites/admin/src/__tests__/api.test.ts), and [database guidance](../../data/database.md#inventory-consumption-history).
- **Checks run and results:** Admin build passed. Three focused Worker delete tests passed (unreferenced delete, referenced-history conflict, FK-race conflict). The focused admin API-client message test passed. Changed TS/Markdown formatting and `git diff --check` passed.
- **Deferred/follow-up:** Archive/soft-delete behavior remains out of scope; hard deletion is blocked while consumption history references the item. No production or remote D1 operations were run.
- **Closed date:** 2026-10-18

## Refinement notes

- 2026-10-18: Captured from the user-reported D1 foreign-key error and current schema/handler evidence. For this implementation, preserve history by refusing hard deletion of referenced items; no schema migration is required.
- 2026-10-18: Implemented the history-preserving conflict behavior and admin message; verified focused tests and the admin build.
