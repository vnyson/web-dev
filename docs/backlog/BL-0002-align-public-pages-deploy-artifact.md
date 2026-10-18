# BL-0002: Align public Pages deployment with the Astro build output

**Status:** Refining  
**Priority:** Untriaged  
**Owner:** Unassigned  
**Created:** 2026-10-18  
**Updated:** 2026-10-18  
**Labels:** deployment, public-site, astro

## Problem and desired outcome

- **Who is affected?** The site owner and visitors to the public tennis-stringing site.
- **Problem/evidence:** The public site is configured as a static Astro build with `outDir: './dist'` in [Astro config](../../sites/tennis-stringing/astro.config.mjs). The [public Pages workflow](../../.github/workflows/deploy-cloudflare.yml) runs `yarn build` and passes `sites/tennis-stringing` as the upload directory, rather than the apparent build output at `sites/tennis-stringing/dist`. Cloudflare Pages project settings or legacy files may affect the intended artifact, so confirm the effective behavior before treating this as a deployment defect.
- **Desired outcome:** The public Pages deployment consistently publishes the intended, current Astro-generated site and its assets, with the configured artifact path understandable from repository automation.

## User story

As a **site owner**, I want **the Pages workflow to deploy the verified public-site build artifact**, so that **visitors receive the intended generated site after a successful deployment**.

## Acceptance criteria

- [ ] The effective Cloudflare Pages build/deployment configuration is verified, including whether GitHub Actions or project settings control the production artifact.
- [ ] The documented and automated artifact path matches the verified intended output; no unrelated source files are accidentally used as the site artifact.
- [ ] A safe validation confirms that the deployed artifact contains the expected entry page and generated assets.
- [ ] The deployment documentation reflects the verified workflow and any required project settings.

## Scope

- **In scope:** Inspect the Astro output, Pages workflow, project/build configuration available in the repository, and deployment ownership; align the configured artifact and docs after confirming intended behavior.
- **Out of scope:** Redesigning the site, changing domains or Cloudflare projects, making an unrequested production deployment, or changing the admin/Worker deployment workflows.
- **Affected workspaces/surfaces:** Public Astro site build config/output, public Pages GitHub Actions workflow, deployment documentation.

## Context and evidence

- **Current behavior/evidence:** [Astro config](../../sites/tennis-stringing/astro.config.mjs) explicitly sets static output and `dist`; [public Pages workflow](../../.github/workflows/deploy-cloudflare.yml) builds and uploads the workspace root. The [root build script](../../package.json) invokes Turbo.
- **Relevant source, tests, configs, migrations, workflows, docs:** Links above; [development workflow guide](../development/workflows.md#ci-and-deployment), [public site manifest](../../sites/tennis-stringing/package.json), and [Turbo config](../../turbo.json).
- **Related cards/decisions/issues:** None known.

## Pickup context checklist

- [ ] Re-read the public-site Astro config, package scripts, Turbo outputs, and deployment workflow.
- [ ] Determine whether the Cloudflare Pages project has independent build settings or whether the GitHub Action is the sole deploy path; request owner access/context if repository files cannot establish this.
- [ ] Inspect repository history or current Pages configuration for legacy static-site expectations before changing the artifact path.
- [ ] Build locally and inspect the actual generated output and required public assets.
- [ ] Agree on a safe artifact validation strategy; do not trigger a production deploy without explicit authorization.

## Dependencies and decisions

- **Dependencies:** Access to reliable information about the Cloudflare Pages project configuration or confirmation from its owner.
- **Blocking decisions:** Confirm the intended source of truth for production Pages build/deployment configuration and whether the apparent artifact mismatch is currently user-visible. Owner: site maintainer.
- **Assumptions to verify:** Cloudflare Pages should publish the Astro `dist` output; verify whether workflow or project settings override this apparent mismatch.

## Quality, risks, and verification

- **Accessibility/responsive:** No intended UI behavior change; verify representative generated pages/assets remain present.
- **Security/privacy/data:** No data-schema or credential change expected. Never print or store Cloudflare secrets while inspecting configuration.
- **Compatibility/performance/operations:** Preserve deployment project, domain, branch triggers, and permissions unless separately approved.
- **Risks/mitigations:** A path change could replace a currently working deployment artifact with an incomplete output. Establish the effective current behavior and inspect output before changing automation; use non-production validation where available.
- **Verification:** Build the public site; inspect the selected artifact contents; validate workflow changes and deployment behavior using an approved preview/non-production path. Production deployment is not part of this card unless separately authorized.
- **Documentation updates:** Update [development workflows](../development/workflows.md#ci-and-deployment) and any relevant site/deployment README after configuration is verified.

## Delivery record

- **Implemented:** Pending.
- **Changed areas/decision links:** Pending.
- **Checks run and results:** No implementation checks run; this is a proposed backlog card.
- **Deferred/follow-up:** Pending.
- **Closed date:** Pending.

## Refinement notes

- 2026-10-18: Captured from the observable difference between Astro's configured `dist` output and the workflow's upload directory. Deployment project settings and expected production artifact still require owner/context verification.
