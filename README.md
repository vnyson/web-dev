# Personal Brand Monorepo

Monorepo for personal brand design system and multiple static sites.

## Live Site

https://vnyson.com

## Monorepo Structure

```
.
├── packages/
│   └── design-system/          # @vnyson/design-system
│       ├── css/tokens.css      # Design tokens (colors, typography, spacing)
│       ├── css/base.css        # Reset and base styles
│       └── css/components.css  # Reusable component styles
├── sites/
│   └── tennis-stringing/       # Tennis Stringing & Racket Services
│       ├── index.html
│       ├── css/style.css       # Site-specific styles
│       └── package.json        # Workspace dependency
├── .github/workflows/deploy.yml # CI/CD workflow
├── package.json               # Yarn workspaces root
└── turbo.json                 # Turbo task pipeline
```

## Package Management

Uses **Yarn 4** with workspaces and **Turborepo** for task orchestration.

### Setup

```bash
# Install Yarn if not already installed
corepack enable
corepack prepare yarn@4.5.0 --activate

# Install dependencies
yarn install
```

### Development Commands

```bash
# Run all builds (uses Turbo caching)
yarn build

# Start all dev servers
yarn dev
```

## Code Quality

Linting and formatting tools are configured at the repo root.

### Commands

```bash
# Run all linters (ESLint + Stylelint + HTMLHint)
yarn lint

# Run individual linters
yarn lint:css    # Stylelint only
yarn lint:html  # HTMLHint only

# Format all files with Prettier
yarn format

# Check formatting without writing
yarn format:check
```

### Tooling

| Tool         | Config              | Purpose                                   |
| ------------ | ------------------- | ----------------------------------------- |
| Prettier     | `.prettierrc`       | Code formatting (JS, CSS, HTML, JSON, MD) |
| ESLint       | `eslint.config.cjs` | JS linting (v9 flat config)               |
| Stylelint    | `.stylelintrc.json` | CSS linting                               |
| HTMLHint     | `.htmlhintrc`       | HTML markup validation                    |
| EditorConfig | `.editorconfig`     | Baseline editor consistency               |

### Commit Conventions

Use [Conventional Commits](https://conventionalcommits.org/): `type(scope): description`

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`, `build`, `ci`

## Design System (@vnyson/design-system)

Shared CSS design tokens and components published to npm.

### Publishing to npm

```bash
cd packages/design-system
yarn npm publish --access=public
```

### Using in a Site

```css
/* Local development (yarn workspace) */
@import '../../../packages/design-system/css/tokens.css';

/* After npm publish */
@import '@vnyson/design-system/css/tokens.css';
```

## Deployment

### Cloudflare Pages (Primary)

Configured for automatic deployment to Cloudflare Pages on every push to `main`.

- URL: `https://tennis-stringing.pages.dev` (or your custom domain)

### GitHub Pages (Fallback)

Alternative deployment available at `https://vnyson.github.io/stringing-static-site/`

See [PUBLISHING.md](PUBLISHING.md) for setup instructions.

## Adding a New Site

1. Create `sites/new-site/` directory
2. Add `package.json` with workspace dependency: `"@vnyson/design-system": "workspace:*"`
3. Create your `index.html` and `css/style.css`
4. Add site-specific workflow if deploying separately

## Migration Notes

- Currently on GitHub Pages (public repo required for free tier)
- Can migrate to Cloudflare Pages later for private repo + better performance
- Custom domain can be added to either platform
