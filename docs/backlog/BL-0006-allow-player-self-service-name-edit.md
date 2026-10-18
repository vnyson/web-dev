# BL-0006: Let players correct their own profile name

**Status:** Refining  
**Priority:** Untriaged  
**Owner:** Unassigned  
**Created:** 2026-10-18  
**Updated:** 2026-10-18  
**Labels:** feature, public-site, player-profile, privacy

## Problem and desired outcome

- **Who is affected?** Players using the public player-facing profile.
- **Problem/evidence:** The user reports that player records often contain only a first name and wants players to edit their own name from the user-facing UI. The profile form currently marks the name input read-only, and the save handler submits `currentPlayerData.name` rather than the edited field value. The token-authorized Worker player update path already accepts a name in its request body, but validation and UI behavior need careful review.
- **Desired outcome:** A verified player can correct or complete their own profile name, with sensible validation and without weakening the phone-based identity verification or another player's access controls.

## User story

As a **player**, I want **to edit the name shown on my own profile**, so that **I can correct an incomplete name record without contacting an administrator**.

## Acceptance criteria

- [ ] A player with a valid access token can edit and save their own profile name from the public profile UI.
- [ ] A player cannot use their token to change another player's name; the Worker continues to enforce token ownership for the target player ID.
- [ ] Name input validation gives the player a clear response for blank or otherwise invalid input; accepted length/character requirements are explicitly agreed and consistent between UI and API.
- [ ] Save success updates the displayed profile name and provides clear confirmation; failure preserves a recoverable editing state and reports a useful message.
- [ ] The phone-based player verification requirements are unchanged unless a separate decision explicitly changes them.
- [ ] Tests cover UI submission of the edited value, token-authorized update, invalid names, and prevention of cross-player updates.
- [ ] The expected effect on existing job/history name snapshots is explicit; historical records are not silently rewritten unless required and approved.

## Scope

- **In scope:** Make the player's own name editable in the public profile, submit the edited value to the existing update API, add deliberate name validation and regression coverage, and clarify historical display behavior.
- **Out of scope:** Removing phone-based identity verification, changing token issuance/storage, allowing public edits to other profile fields beyond existing behavior, changing name matching/verification policy, or retroactively rewriting job/history snapshots without a separate requirement.
- **Affected workspaces/surfaces:** Public profile component and page save flow, public API client/tests, Worker player update authorization/validation/tests, potentially player-facing data-contract documentation.

## Context and evidence

- **Current behavior/evidence:** [Profile form](../../sites/tennis-stringing/src/components/ProfileOverlay.astro) renders a read-only name input. [Profile save handler](../../sites/tennis-stringing/src/pages/index.astro) currently uses `currentPlayerData.name` for the payload. [Public API client](../../sites/tennis-stringing/src/lib/api.ts) sends `PUT /api/players/:id` with the token. The Worker `handlePlayers` update branch permits a player token only when it resolves to the requested player ID and currently writes `body.name`. [Player verification](../../workers/api/src/index.ts) still requires a non-empty name query plus phone-based proof; its name match is a case-insensitive substring. The [players migration](../../db/migrations/0001_players.sql) has a non-null name column.
- **Relevant source, tests, configs, migrations, workflows, docs:** [Public profile component](../../sites/tennis-stringing/src/components/ProfileOverlay.astro), [public page](../../sites/tennis-stringing/src/pages/index.astro), [public API client](../../sites/tennis-stringing/src/lib/api.ts), [public API tests](../../sites/tennis-stringing/src/__tests__/api.test.ts), [Worker player handlers](../../workers/api/src/index.ts), [Worker tests](../../workers/api/src/__tests__/index.test.ts), [players migration](../../db/migrations/0001_players.sql).
- **Related cards/decisions/issues:** None known.

## Pickup context checklist

- [ ] Re-read profile name input and save flow, including how profile data is loaded and state is refreshed after save.
- [ ] Re-read Worker player update authorization and validation; verify a player token can update only the matching player ID and check admin behavior separately.
- [ ] Review token storage and URL/query usage sufficiently to avoid exposing tokens in new UI flows, logs, or links.
- [ ] Inspect all places that display player names and the snapshot behavior for existing stringing/history records.
- [ ] Confirm name rules (minimum/maximum length, whitespace trimming, supported scripts/characters) with the product owner; avoid inventing restrictive rules that reject legitimate names.
- [ ] Inspect test setup and existing public E2E profile patterns; add regression coverage without weakening auth checks or using real personal data.

## Dependencies and decisions

- **Dependencies:** Existing player token verification and profile update flow.
- **Blocking decisions:** Confirm acceptable name validation rules and whether a profile rename should affect only the player record or also future display of existing job/history snapshots. Owner: product/data maintainer.
- **Assumptions to verify:** The intended change is editability of the player's own profile name, not removal of the phone/name verification checks used to establish identity.

## Quality, risks, and verification

- **Accessibility/responsive:** Name field and save/cancel actions need accessible labels, visible focus, keyboard operation, and usable mobile layout.
- **Security/privacy/data:** Preserve token-to-player ownership checks. Do not reveal whether another player's record exists; never log or expose access tokens or unnecessary personal data.
- **Compatibility/performance/operations:** Existing profile update clients and admin player editing must remain compatible with the API contract.
- **Risks/mitigations:** Weakening verification or ownership checks could allow account takeover; scope this to the authenticated player's own profile and test negative authorization cases. Existing historical snapshots may continue showing an old name; document the chosen behavior.
- **Verification:** Add public UI/API tests and Worker authorization/validation tests; run relevant unit and player-profile browser tests and affected site/Worker builds.
- **Documentation updates:** Update player-profile/API guidance if validation or snapshot display semantics change; otherwise N/A with reason.

## Delivery record

- **Implemented:** Pending.
- **Changed areas/decision links:** Pending.
- **Checks run and results:** No implementation checks run; this is a proposed backlog card.
- **Deferred/follow-up:** Pending.
- **Closed date:** Pending.

## Refinement notes

- 2026-10-18: Captured from the user request. Inspection found that the public UI blocks editing although the token-authorized Worker update path already accepts `name`; verification and authorization should remain intact. Validation policy and historical snapshot behavior need confirmation.
