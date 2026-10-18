# BL-0001: Run automated tests in pull-request CI

**Status:** Refining  
**Priority:** Untriaged  
**Owner:** Unassigned  
**Created:** 2026-10-18  
**Updated:** 2026-10-18  
**Labels:** ci, testing, monorepo

## Problem and desired outcome

- **Who is affected?** Contributors and maintainers reviewing changes.
- **Problem/evidence:** Automated tests exist, but the current [CI workflow](../../.github/workflows/ci.yml) runs formatting, lint, and builds without invoking the root Vitest or Playwright scripts. Test commands are defined in the [root manifest](../../package.json); Playwright config builds the public site and serves it locally.
- **Desired outcome:** Changes receive repeatable automated regression checks before merge, with failures visible in CI rather than relying only on local testing.

## User story

As a **contributor**, I want **the relevant automated test suites to run in pull-request CI**, so that **regressions are caught before changes are merged**.

## Acceptance criteria

- [ ] The agreed automated test suites run in CI for pull requests targeting supported branches.
- [ ] CI reports a failing test as a failed check, preventing a green result.
- [ ] Browser-test prerequisites (including browser installation and the built-site test server) are provisioned reproducibly if E2E tests are included.
- [ ] CI behavior and any intentionally excluded test suite are documented accurately.

## Scope

- **In scope:** Decide which existing test suites run on pull requests; wire the selected commands and prerequisites into GitHub Actions; document the resulting CI coverage.
- **Out of scope:** Expanding product behavior or test coverage as part of this infrastructure story; making deployment changes.
- **Affected workspaces/surfaces:** Root CI workflow, Vitest tests, tennis-site Playwright E2E tests, package scripts/configuration, development workflow documentation.

## Context and evidence

- **Current behavior/evidence:** [CI workflow](../../.github/workflows/ci.yml) currently runs `yarn format:check`, `yarn lint`, and `yarn build`. Root scripts expose `yarn test` and `yarn test:e2e`. [Vitest config](../../vitest.config.ts) defines the unit-test environment; [Playwright config](../../playwright.config.ts) builds the site and starts [the test server](../../test/server.cjs). Existing tests are under [Worker API](../../workers/api/src/__tests__/), [admin](../../sites/admin/src/__tests__/), [public-site unit tests](../../sites/tennis-stringing/src/__tests__/), and [public-site E2E tests](../../sites/tennis-stringing/__tests__/e2e/).
- **Relevant source, tests, configs, migrations, workflows, docs:** Links above; [development workflow guide](../development/workflows.md#quality-and-tests).
- **Related cards/decisions/issues:** None known.

## Pickup context checklist

- [ ] Re-read current CI workflow, root scripts, Turbo task graph, and lockfile/runtime setup.
- [ ] Run the selected test commands locally and record duration, flakiness, and environment requirements.
- [ ] Verify whether Playwright's browser binaries can be installed and cached reliably on the current GitHub runner.
- [ ] Confirm the PR branches/events and whether tests are required for both `main` and `admin`.
- [ ] Check current test data/setup for credentials, network access, or mutable external state; keep CI secrets unnecessary where possible.

## Dependencies and decisions

- **Dependencies:** Existing test suites and GitHub Actions workflow.
- **Blocking decisions:** Confirm whether pull-request CI should run Vitest only, Vitest plus Playwright, or a staged/optional E2E job. Owner: repository maintainers.
- **Assumptions to verify:** Test runtimes and determinism are acceptable for required PR checks; no suite needs production credentials or external services.

## Quality, risks, and verification

- **Accessibility/responsive:** N/A to CI wiring itself; retain existing browser coverage of responsive behavior where E2E is selected.
- **Security/privacy/data:** Do not add production credentials to test jobs. Verify fixtures are safe and non-sensitive.
- **Compatibility/performance/operations:** Check total workflow duration and browser-install reliability; avoid making flaky tests a required merge gate without addressing flakiness.
- **Risks/mitigations:** Longer or flaky checks may slow merges; record a baseline and consider separating unit and browser jobs while making the agreed checks visible.
- **Verification:** Run the selected test commands locally; validate workflow syntax and confirm a deliberately failing test causes the relevant CI job to fail in a safe test change or equivalent controlled verification.
- **Documentation updates:** Update [development workflows](../development/workflows.md) to describe actual CI checks and any intentional exclusions.

## Delivery record

- **Implemented:** Pending.
- **Changed areas/decision links:** Pending.
- **Checks run and results:** No implementation checks run; this is a proposed backlog card.
- **Deferred/follow-up:** Pending.
- **Closed date:** Pending.

## Refinement notes

- 2026-10-18: Captured from verified gap between existing root test scripts/configuration and the current CI workflow. Scope of required E2E coverage remains for maintainer confirmation.
