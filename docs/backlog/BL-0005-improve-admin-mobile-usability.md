# BL-0005: Make admin management workflows usable on mobile

**Status:** Refining  
**Priority:** Untriaged  
**Owner:** Unassigned  
**Created:** 2026-10-18  
**Updated:** 2026-10-18  
**Labels:** feature, admin, mobile, responsive, accessibility

## Problem and desired outcome

- **Who is affected?** Admin users working from phones or narrow browser windows.
- **Problem/evidence:** The reporter says the admin site is generally difficult to use on mobile and row Edit/Delete actions require scrolling to reach. Initial inspection found horizontally scrollable tables on jobs and inventory pages, with Actions columns after data columns; players and customization pages also contain data tables. The user suggested reducing visible columns when details are not expanded and making the mobile feature set more practical.
- **Desired outcome:** Admins can efficiently find key information and use important row actions on narrow screens, with secondary details available without forcing users to scroll across wide tables.

## User story

As an **admin user on a mobile device**, I want **management screens to prioritize essential information and keep common actions easy to reach**, so that **I can complete routine admin work without awkward horizontal scrolling**.

## Acceptance criteria

- [ ] At agreed mobile viewport sizes, primary row actions (including Edit and Delete where available) are discoverable and operable without horizontal scrolling across the full table.
- [ ] Jobs, inventory, players, and other agreed high-use management screens present essential fields first; secondary fields may be collapsed, hidden behind an accessible disclosure, or presented in another approved compact layout.
- [ ] Users can still access all relevant row information and actions; responsive presentation does not silently remove capabilities available on desktop.
- [ ] Layout works at the agreed breakpoints without clipped controls, unintended page-level horizontal overflow, or unusable touch targets.
- [ ] Keyboard and screen-reader users can identify and operate disclosures, row actions, dialogs, and status feedback.
- [ ] Browser/responsive tests cover representative management views at desktop and mobile widths, including access to row actions and expanded details.

## Scope

- **In scope:** Audit and improve responsive behavior for core admin management workflows, prioritizing jobs, inventory, and players; agree a pattern for prioritizing/collapsing secondary columns; add responsive regression coverage.
- **Out of scope:** Replacing the admin visual design system or changing business capabilities/data fields solely for mobile presentation.
- **Affected workspaces/surfaces:** Admin Astro pages and shared styles/components, particularly jobs, inventory, players, and possibly customization/history pages; browser tests.

## Context and evidence

- **Current behavior/evidence:** The user reports Edit/Delete actions require scrolling on mobile and requests minimized columns until expanded. Jobs and inventory include `overflow-x-auto` table wrappers and Actions columns after data columns. Players and customization also use tables; current responsive behavior and real-device experience need broader audit.
- **Relevant source, tests, configs, migrations, workflows, docs:** [Jobs page](../../sites/admin/src/pages/jobs.astro), [inventory page](../../sites/admin/src/pages/inventory.astro), [players page](../../sites/admin/src/pages/players.astro), [customization page](../../sites/admin/src/pages/customization.astro), [admin styles](../../sites/admin/src/styles/), [Playwright config](../../playwright.config.ts), and [existing public-site responsive tests](../../sites/tennis-stringing/__tests__/e2e/responsive-layout.spec.js) as a test-pattern reference only.
- **Related cards/decisions/issues:** BL-0004 concerns the job editing route; mobile layout must not be blocked on that bugfix, but should ensure the eventual edit action remains accessible.

## Pickup context checklist

- [ ] Audit all admin pages and shared layouts/components at representative narrow and wide viewport widths; distinguish page-level overflow from intentional table overflow.
- [ ] Identify the most frequent/high-priority admin tasks and row actions; confirm whether all management pages are in initial scope.
- [ ] Agree mobile breakpoints and whether compact rows, responsive cards, sticky actions, or expandable secondary columns best fit existing UI.
- [ ] Inspect available Astro/Playwright setup for testing admin routes and authenticated states; avoid adding test-only bypasses that weaken production behavior.
- [ ] Check touch target, keyboard focus, disclosure semantics, and long-content behavior for proposed patterns.

## Dependencies and decisions

- **Dependencies:** Admin page inventory and representative supported/testable user states.
- **Blocking decisions:** Confirm initial page scope and preferred compact interaction pattern (for example, card layout or expandable secondary columns). Owner: admin/product maintainer.
- **Assumptions to verify:** The reporter's action-scrolling problem occurs on all or only some admin tables; identify device widths and pages most affected during pickup.

## Quality, risks, and verification

- **Accessibility/responsive:** Preserve semantic table relationships where appropriate; disclosures need accessible names/state, keyboard operation, visible focus, and usable touch targets. Verify at agreed viewports and zoom levels.
- **Security/privacy/data:** No data-contract change intended; avoid exposing extra customer data in compact summaries.
- **Compatibility/performance/operations:** Keep desktop workflows functional and minimize duplicated markup/state between responsive layouts.
- **Risks/mitigations:** Hiding columns could make important data undiscoverable or cause desktop/mobile divergence. Agree essential vs secondary fields per page and test expanded states.
- **Verification:** Add admin-specific responsive/browser coverage for key workflows and actions at agreed viewports; run admin build and relevant checks; manually inspect representative real/narrow viewport layouts.
- **Documentation updates:** Update admin UI/workflow docs if mobile interaction patterns or supported workflows change materially.

## Delivery record

- **Implemented:** Pending.
- **Changed areas/decision links:** Pending.
- **Checks run and results:** No implementation checks run; this is a proposed backlog card.
- **Deferred/follow-up:** Pending.
- **Closed date:** Pending.

## Refinement notes

- 2026-10-18: Captured from the user's mobile-usability report and initial table/action inspection. Page priority, breakpoints, and compact interaction pattern remain open.
