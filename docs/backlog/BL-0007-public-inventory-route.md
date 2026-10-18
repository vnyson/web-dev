# BL-0007: Add a direct public inventory route

**Status:** Refining
**Priority:** Untriaged
**Owner:** Unassigned
**Created:** 2026-10-18
**Updated:** 2026-10-18
**Labels:** feature, public-site, inventory, navigation

## Problem and desired outcome

- **Who is affected?** Visitors to the public tennis-stringing site who want to browse available strings and equipment.
- **Problem/evidence:** Inventory is currently shown in an overlay opened by `.inventory-button` controls. The user wants a direct `/inventory` route that automatically opens the inventory menu when visited.
- **Desired outcome:** Visitors can open and share a stable URL for inventory, and that URL presents the existing inventory browsing experience immediately.

## User story

As a **site visitor**, I want **to visit `/inventory` directly and see the inventory menu opened**, so that **I can browse or share available inventory without first finding an overlay button**.

## Acceptance criteria

- [ ] Directly visiting `/inventory` loads the public site and opens the inventory UI automatically.
- [ ] Refreshing `/inventory` continues to open inventory, and browser back/forward navigation behaves predictably.
- [ ] Existing overlay buttons continue to work on the home page.
- [ ] Zero-quantity inventory is not shown to visitors; only available items appear in the route and existing overlay.
- [ ] Missing/failed inventory data produces a clear empty/error state without breaking the rest of the page.
- [ ] Browser tests cover direct route load, automatic open, and the existing home-page overlay entry point.

## Scope

- **In scope:** Add a static-compatible public route and connect it to the existing inventory overlay behavior, including direct-link and refresh handling.
- **Out of scope:** Adding public purchase/reservation capabilities, exposing admin actions, or changing inventory-management behavior.
- **Affected workspaces/surfaces:** Public tennis Astro pages/components, inventory overlay navigation/client behavior, public E2E tests, and deployment workflow if route output requires configuration.

## Context and evidence

- **Current behavior/evidence:** Inventory overlay is declared in [InventoryOverlay.astro](../../sites/tennis-stringing/src/components/InventoryOverlay.astro), opened by controls in [the home page](../../sites/tennis-stringing/src/pages/index.astro), and populated by `fetchInventory()` in the public API client.
- **Relevant source, tests, configs, migrations, workflows, docs:** [Public pages](../../sites/tennis-stringing/src/pages/), [inventory overlay](../../sites/tennis-stringing/src/components/InventoryOverlay.astro), [public API client](../../sites/tennis-stringing/src/lib/api.ts), [Playwright config](../../playwright.config.ts), and [public E2E tests](../../sites/tennis-stringing/__tests__/e2e/).
- **Related cards/decisions/issues:** The public client now filters zero-stock items as part of the related inventory availability requirement; verify that behavior when implementing this route.

## Pickup context checklist

- [ ] Re-read Astro static routing/output configuration, root page navigation, overlay startup code, and current deployment artifact configuration.
- [ ] Decide whether `/inventory` should render the overlay over the home page, use a dedicated inventory page/layout, or expose the same content as a standalone page; ensure direct links and browser history work.
- [ ] Re-check public inventory API payload and zero-stock filtering against current data behavior.
- [ ] Verify route output in `dist` and how the deployment host resolves the clean `/inventory` path.
- [ ] Add browser coverage for direct load, reload, back/forward, and existing overlay controls.

## Dependencies and decisions

- **Dependencies:** Public inventory API and existing inventory display/overlay.
- **Blocking decisions:** Confirm whether `/inventory` should be a dedicated standalone page or the home page with the existing overlay auto-opened. Owner: site/product maintainer.
- **Assumptions to verify:** A static `/inventory/` route is compatible with the current Pages deployment configuration; current deployment workflow artifact path needs independent verification.

## Quality, risks, and verification

- **Accessibility/responsive:** Automatically opened inventory content must retain accessible dialog/overlay semantics, focus behavior, close control, and mobile layout.
- **Security/privacy/data:** Keep the route read-only and display only public inventory fields; do not expose admin data or actions.
- **Compatibility/performance/operations:** Preserve home-page behavior and static hosting; validate clean-path routing and refresh behavior.
- **Risks/mitigations:** Reusing an overlay on a separate static route can produce awkward back/forward or close behavior; decide the navigation model before implementation and test it in-browser.
- **Verification:** Build the public site, inspect generated route files, and add/run Playwright checks for route loading and history behavior.
- **Documentation updates:** Update public-site navigation docs/README if a new route is added; verify deployment notes after confirming artifact configuration.

## Delivery record

- **Implemented:** Pending.
- **Changed areas/decision links:** Pending.
- **Checks run and results:** No implementation checks run; this is a proposed backlog card.
- **Deferred/follow-up:** Pending.
- **Closed date:** Pending.

## Refinement notes

- 2026-10-18: Captured from the user request. Route composition and browser-history behavior remain to be decided during refinement.
