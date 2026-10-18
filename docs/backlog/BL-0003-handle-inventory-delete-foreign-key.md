# BL-0003: Handle inventory deletion when consumption history exists

**Status:** Refining  
**Priority:** Untriaged  
**Owner:** Unassigned  
**Created:** 2026-10-18  
**Updated:** 2026-10-18  
**Labels:** bug, admin, inventory, api, database

## Problem and desired outcome

- **Who is affected?** Admin users managing inventory and the staff relying on accurate inventory and stringing history.
- **Problem/evidence:** The reporter sees an internal-server error when deleting some inventory items: `D1_ERROR: FOREIGN KEY constraint failed` (`SQLITE_CONSTRAINT_FOREIGNKEY`). The [inventory delete handler](../../workers/api/src/index.ts) deletes the inventory row directly. The [inventory-consumption migration](../../db/migrations/0006_inventory_consumption.sql) references `inventory(id)` without an `ON DELETE` action, so a referenced row cannot be removed under the current foreign-key behavior.
- **Desired outcome:** Admins receive a predictable, actionable outcome when deleting inventory, and historical consumption data is not silently lost or made misleading.

## User story

As an **admin user**, I want **inventory deletion to handle items referenced by stringing consumption history**, so that **I can manage inventory without unexplained server errors or loss of historical records**.

## Acceptance criteria

- [ ] Given an inventory item with no consumption references, when an authorized admin deletes it, then deletion succeeds and the UI reflects its removal.
- [ ] Given an item referenced by consumption history, when an admin attempts deletion, then behavior follows an explicitly approved history-retention policy and the user receives a clear result rather than an unexplained internal-server error.
- [ ] Given deletion cannot proceed, then the existing item and its historical records remain consistent and the user is told what action is available.
- [ ] Tests cover successful deletion and the referenced-item case, including the selected persistence behavior.

## Scope

- **In scope:** Define and implement inventory deletion semantics for items with consumption records; return useful API/UI feedback; cover the behavior with tests.
- **Out of scope:** Rewriting past consumption history or changing unrelated inventory CRUD behavior.
- **Affected workspaces/surfaces:** Worker inventory handler, D1 inventory-consumption relationship, admin API client, inventory page and tests.

## Context and evidence

- **Current behavior/evidence:** [Inventory delete handler](../../workers/api/src/index.ts) issues a direct inventory delete. [Migration 0006](../../db/migrations/0006_inventory_consumption.sql) defines the foreign key to inventory without cascade/set-null behavior. Stringing creation records consumption in the Worker; stringing deletion explicitly processes those records before removing jobs. The reporter supplied the FK error above.
- **Relevant source, tests, configs, migrations, workflows, docs:** [Worker API tests](../../workers/api/src/__tests__/index.test.ts), [admin API client](../../sites/admin/src/lib/api.ts), [admin API tests](../../sites/admin/src/__tests__/api.test.ts), and [inventory page](../../sites/admin/src/pages/inventory.astro).
- **Related cards/decisions/issues:** None known.

## Pickup context checklist

- [ ] Re-read the current inventory DELETE handler and UI/API delete flow, including error presentation.
- [ ] Re-read inventory-consumption creation, query, and stringing-job deletion logic; identify any other references to inventory rows.
- [ ] Inspect the current schema, migration history, D1 behavior, and any existing production/local data constraints before proposing a migration.
- [ ] Verify the current Worker tests reach the authenticated DELETE path and model a foreign-key rejection.
- [ ] Inspect how historical views display consumed inventory; determine whether a deleted item's identity must remain available to users.

## Dependencies and decisions

- **Dependencies:** Current inventory-consumption data contract and D1 schema.
- **Blocking decisions:** Choose expected behavior for a referenced item: prevent deletion with a clear explanation, archive/soft-delete it, preserve consumption history with a suitable reference strategy, or another owner-approved option. Owner: product/data maintainer. Do not cascade-delete history by default.
- **Assumptions to verify:** The reported error occurs when consumption rows reference the target item; confirm against current data and code rather than assuming every reported failure has the same cause.

## Quality, risks, and verification

- **Accessibility/responsive:** Ensure any confirmation/error feedback is perceivable and usable with keyboard and assistive technology.
- **Security/privacy/data:** Preserve historical records and avoid exposing raw internal SQL details to end users.
- **Compatibility/performance/operations:** If schema changes are needed, add a new migration; do not rewrite applied migrations. Do not run remote D1 operations without explicit authorization.
- **Risks/mitigations:** Cascading deletion could erase auditable consumption history; setting references to null could lose item identity. Settle the data-retention policy before selecting a schema/handler solution.
- **Verification:** Add Worker coverage for authorized deletion with and without references; cover API/UI feedback as applicable; run focused tests and relevant builds; review migration behavior locally if one is added.
- **Documentation updates:** Update database guidance/API behavior docs if deletion or retention semantics change.

## Delivery record

- **Implemented:** Pending.
- **Changed areas/decision links:** Pending.
- **Checks run and results:** No implementation checks run; this is a proposed backlog card.
- **Deferred/follow-up:** Pending.
- **Closed date:** Pending.

## Refinement notes

- 2026-10-18: Captured from the user-reported D1 foreign-key error and current schema/handler evidence. History-retention behavior is intentionally unresolved.
