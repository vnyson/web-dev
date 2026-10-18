# BL-0004: Keep job editing within the selected job flow

**Status:** Refining  
**Priority:** Untriaged  
**Owner:** Unassigned  
**Created:** 2026-10-18  
**Updated:** 2026-10-18  
**Labels:** bug, admin, jobs, navigation

## Problem and desired outcome

- **Who is affected?** Admin users editing stringing jobs.
- **Problem/evidence:** The reporter says editing a job in any state reloads the page and returns to the main admin landing page. The Jobs page's `editJob()` currently navigates to `/jobs/edit/{id}` and contains a comment that the edit page is to be implemented. No matching edit route was found in the admin page source during refinement. Confirm the observed deployed behavior and hosting fallback/redirect configuration when picking this up.
- **Desired outcome:** Choosing Edit opens the selected job's editable state, saves supported changes, and returns to a deliberate admin destination without unexpectedly dumping the user at the landing page.

## User story

As an **admin user**, I want **to edit a job in any supported state and remain in the job-management flow**, so that **I can correct job details without losing my place or being sent to the admin landing page**.

## Acceptance criteria

- [ ] Given a job in each supported status, when an admin chooses Edit, then the edit flow loads the correct job rather than reloading to the landing page.
- [ ] Given the job is loaded, when the admin saves valid supported changes, then the changes persist and the user is routed to an explicitly agreed destination.
- [ ] Given the job cannot be loaded or saved, then the user receives a clear error and can recover without losing unsaved input where practical.
- [ ] Tests cover selecting/editing jobs across supported states, successful save/navigation, and load/save failures.

## Scope

- **In scope:** Trace and repair the edit navigation/route and the supported job update flow; define predictable post-save and failure behavior; add regression coverage.
- **Out of scope:** Changing job-status business rules or adding unrelated job fields/status transitions without separate requirements.
- **Affected workspaces/surfaces:** Admin Jobs page and edit route/form, admin API client, Worker job update handler if required, and relevant tests/configuration.

## Context and evidence

- **Current behavior/evidence:** The Jobs page renders Edit actions and its `editJob()` navigates to `/jobs/edit/${jobId}` with a comment that the route is not implemented. The admin Astro app uses static output. The reporter observes a reload to the admin landing page for jobs in any state; hosting behavior has not yet been independently reproduced.
- **Relevant source, tests, configs, migrations, workflows, docs:** [Jobs page](../../sites/admin/src/pages/jobs.astro), [admin Astro config](../../sites/admin/astro.config.mjs), [admin API client](../../sites/admin/src/lib/api.ts), [Worker job handler](../../workers/api/src/index.ts), [admin API tests](../../sites/admin/src/__tests__/api.test.ts), and [Worker tests](../../workers/api/src/__tests__/index.test.ts).
- **Related cards/decisions/issues:** None known.

## Pickup context checklist

- [ ] Reproduce the behavior on the current local build and, if permitted, confirm the deployed route/redirect behavior; record browser URL and outcome without capturing sensitive data.
- [ ] Re-read the jobs list action, route inventory, Astro static output and hosting fallback/redirect settings.
- [ ] Inspect current job read/update API support, allowed fields, authorization, and all job statuses before defining the edit form.
- [ ] Confirm the intended destination after a successful save (jobs list, job detail, or remain on the edit page).
- [ ] Identify or add the narrowest useful admin page/browser test strategy; current tests may primarily cover API helpers.

## Dependencies and decisions

- **Dependencies:** The current set of editable job fields and status-specific business rules.
- **Blocking decisions:** Confirm which fields are editable and the desired destination after save. Owner: admin/product maintainer.
- **Assumptions to verify:** All job states are intended to be editable; verify whether some fields or transitions are restricted by status.

## Quality, risks, and verification

- **Accessibility/responsive:** Edit and save controls must remain usable on mobile and by keyboard; provide labels and status/error feedback.
- **Security/privacy/data:** Preserve existing admin authorization and avoid exposing player/customer data in URLs, logs, or errors.
- **Compatibility/performance/operations:** Preserve static routing constraints and verify the production host handles nested edit URLs as expected.
- **Risks/mitigations:** A UI-only repair may still fail if the Worker does not support the desired fields; inspect the API contract before committing to form behavior.
- **Verification:** Add route/navigation and save regression tests across statuses, API coverage for supported fields, and a focused admin build/browser check. Re-test direct navigation and page reload at the edit URL.
- **Documentation updates:** Update admin workflow documentation if job editing behavior or supported fields change.

## Delivery record

- **Implemented:** Pending.
- **Changed areas/decision links:** Pending.
- **Checks run and results:** No implementation checks run; this is a proposed backlog card.
- **Deferred/follow-up:** Pending.
- **Closed date:** Pending.

## Refinement notes

- 2026-10-18: Captured from the reported redirect and verified edit link to a route noted in source as not yet implemented. Deployed redirect behavior and edit requirements remain to be confirmed.
