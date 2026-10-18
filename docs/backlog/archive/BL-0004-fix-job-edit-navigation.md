# BL-0004: Keep job editing within the selected job flow

**Status:** Done
**Priority:** Untriaged  
**Owner:** Unassigned  
**Created:** 2026-10-18  
**Updated:** 2026-10-18  
**Labels:** bug, admin, jobs, navigation

## Problem and desired outcome

- **Who is affected?** Admin users editing stringing jobs.
- **Problem/evidence:** The reporter said editing a job in any state reloaded the page and returned to the main admin landing page. Before this change, the Jobs page linked to a nonexistent nested route. The new static edit route fixes local navigation and reload behavior; deployed hosting behavior remains to be verified during a normal deployment/review.
- **Desired outcome:** Choosing Edit opens the selected job's editable state, saves supported changes, and returns to a deliberate admin destination without unexpectedly dumping the user at the landing page.

## User story

As an **admin user**, I want **to edit a job in any supported state and remain in the job-management flow**, so that **I can correct job details without losing my place or being sent to the admin landing page**.

## Acceptance criteria

- [x] Given a job in any existing status, when an admin chooses Edit, then the edit flow loads the correct job rather than reloading to the landing page.
- [x] The form edits only the fields currently supported by the Worker update endpoint: status, strung-at date/time, picked-up date/time, and notes.
- [x] Given the job is loaded, when the admin saves valid changes, then they persist and the user returns to the Jobs list.
- [x] Given the job cannot be loaded or saved, then the user receives a clear error and can recover without losing unsaved input where practical.
- [x] Tests cover selecting/editing jobs across supported states, successful save/navigation, and load/save failures.

## Scope

- **In scope:** Repair the edit navigation with a static-host-compatible route, provide a form for the Worker-supported fields (status, strung-at date/time, picked-up date/time, and notes), return to the Jobs list on success, and add regression coverage.
- **Out of scope:** Changing job-status business rules or adding unrelated job fields/status transitions without separate requirements.
- **Affected workspaces/surfaces:** Admin Jobs page and edit route/form, admin API client, Worker job update handler if required, and relevant tests/configuration.

## Context and evidence

- **Current behavior/evidence:** The Jobs page now links to `/jobs/edit?id=<jobId>`, served by a static Astro page. It loads the authenticated job list, edits fields supported by the Worker update endpoint, and returns to `/jobs` after save.
- **Relevant source, tests, configs, migrations, workflows, docs:** [Jobs page](../../../sites/admin/src/pages/jobs.astro), [edit page](../../../sites/admin/src/pages/jobs/edit.astro), [admin Astro config](../../../sites/admin/astro.config.mjs), [admin Playwright config](../../../playwright.admin.config.ts), [browser regression tests](../../../sites/admin/__tests__/e2e/job-edit.spec.js), [admin API client](../../../sites/admin/src/lib/api.ts), [Worker job handler](../../../workers/api/src/index.ts), and [development workflow guide](../../development/workflows.md).
- **Related cards/decisions/issues:** None known.

## Pickup context checklist

- [x] Re-read the jobs list action, route inventory, Astro static output and hosting configuration.
- [x] Inspect current job read/update API support and authorization. The update handler writes status, strung-at, picked-up-at, and notes; authenticated list fetch can provide the selected job.
- [x] Set post-save destination to the Jobs list and limit editable fields to the existing Worker update contract; do not add job-field or status-rule changes.
- [x] Verify direct navigation and reload locally using the built static Astro preview. Deployed-host behavior remains unverified because no deployment was performed.
- [x] Add focused admin browser tests for navigation, reload, save, and failure states.

## Dependencies and decisions

- **Dependencies:** The existing Worker job-list and update endpoints.
- **Blocking decisions:** None for this scoped implementation. Additional editable fields or status-rule changes require a separate requirement.
- **Assumptions to verify:** All job states are intended to be editable; verify whether some fields or transitions are restricted by status.

## Quality, risks, and verification

- **Accessibility/responsive:** Edit and save controls must remain usable on mobile and by keyboard; provide labels and status/error feedback.
- **Security/privacy/data:** Preserve existing admin authorization and avoid exposing player/customer data in URLs, logs, or errors.
- **Compatibility/performance/operations:** Preserve static routing constraints and verify the production host handles nested edit URLs as expected.
- **Risks/mitigations:** A UI-only repair may still fail if the Worker does not support the desired fields; inspect the API contract before committing to form behavior.
- **Verification:** Add route/navigation and save regression tests across existing statuses, verify supported fields are preserved/submitted, run a focused admin browser test and build. Re-test direct navigation and page reload at the static edit URL.
- **Documentation updates:** Update admin workflow documentation if job editing behavior or supported fields change.

## Delivery record

- **Implemented:** Added a static-host-compatible edit route at `/jobs/edit?id=<jobId>`. Admins can load a selected job, update status, strung-at time, picked-up time, and notes, and return to `/jobs` after save. Load/save failures retain a clear recovery path.
- **Changed areas/decision links:** `sites/admin/src/pages/jobs.astro`, `sites/admin/src/pages/jobs/edit.astro`, `sites/admin/__tests__/e2e/job-edit.spec.js`, `playwright.admin.config.ts`, root `package.json`, `docs/development/workflows.md`, and `sites/admin/README.md`.
- **Checks run and results:** `yarn workspace admin build` passed. `yarn test:e2e:admin` passed (5 tests; covers in_queue, queued, ready_for_pickup, and done states, list navigation, save payload/redirect, load failure, missing ID, and save failure).
- **Deferred/follow-up:** No status-transition or additional job-field rules were added. The deployed-host route behavior should be confirmed during normal deployment/review; no production deployment was run.
- **Closed date:** 2026-10-18

## Refinement notes

- 2026-10-18: Captured from the reported redirect and verified edit link to a route noted in source as not yet implemented.
- 2026-10-18: Implemented using the existing update contract only; save returns to `/jobs`. Additional editable fields/status rules remain out of scope. Built static preview and browser regression tests pass; production-host behavior was not tested because no deployment was performed.
