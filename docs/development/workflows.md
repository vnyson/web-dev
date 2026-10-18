# Development and verification workflows

Check the root and workspace manifests before relying on a command; scripts evolve. The repository uses Yarn 4.5 workspaces and Turborepo.

## Setup and local development

1. Use a supported Node.js version. Root declares Node `>=18`; the admin package declares `>=22.12.0`, so Node 22.12+ satisfies the strictest current package requirement.
2. Enable Corepack if needed and install dependencies from the repository root with `yarn install`.
3. Use `yarn start:dev` to run the public tennis site, admin app, and Worker together. Root scripts configure their local ports: public site `8080`, admin `4321`, API `8787`.
4. `yarn setup:local` applies the local site-settings SQL operation. It is a local database write; inspect the script/config before using it if local state matters.

The public site, admin, and API packages also have their own `dev` scripts. See the [root manifest](../../package.json) and each workspace manifest for current commands. Avoid running remote D1, deploy, publish, or other external-impact commands without explicit authorization.

## Quality and tests

- `yarn build` — build workspaces through Turbo.
- `yarn build:site` — build the public site through the `tennis-stringing-site` Turbo filter.
- `yarn build:admin` — build the admin through the `admin` Turbo filter.
- `yarn lint` — lint JavaScript under `sites`, CSS, and HTML; it does not comprehensively lint Astro or TypeScript.
- `yarn lint:css` — lint CSS in packages and sites.
- `yarn lint:html` — lint HTML files under sites.
- `yarn format:check` / `yarn format` — check formatting or format with Prettier. Prefer the check during validation.
- `yarn test --run` — run Vitest tests discovered by the root config.
- `yarn test:e2e` — run Playwright tests; see [Playwright config](../../playwright.config.ts) and tennis E2E tests.

Run the narrowest relevant test first, then affected workspace builds and formatting. Tests can have side effects or require browser setup; inspect configuration and report skipped checks accurately.

## CI and deployment

The current [CI workflow](../../.github/workflows/ci.yml) runs `yarn format:check`, `yarn lint`, and `yarn build`; it does not run Vitest or Playwright. Deployment workflows are separate: [public Pages](../../.github/workflows/deploy-cloudflare.yml), [admin Pages](../../.github/workflows/deploy-admin.yml), [Worker](../../.github/workflows/deploy-workers.yml), plus preview and npm publishing workflows. Read the applicable workflow before documenting or triggering deployment.

The public Pages workflow currently uploads `sites/tennis-stringing` after building rather than the apparent Astro `dist` output directory. Do not assume the deployed artifact configuration is correct or describe the target as settled without verifying Cloudflare project settings and workflow intent. This documentation records observed configuration, not a deployment fix.
