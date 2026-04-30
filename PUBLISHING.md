# Publishing Guide

## npm Publishing Setup

### 1. Create npm Account
- Sign up at https://www.npmjs.com/
- Enable 2FA (recommended)

### 2. Get npm Access Token
1. Go to https://www.npmjs.com/settings/tokens
2. Click **Generate New Token** → **Granular Access Token**
3. Set packages: `@vnyson/design-system`
4. Permissions: **Publish**
5. Copy the token

### 3. Add GitHub Secret
1. Go to your GitHub repo → **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Name: `NPM_TOKEN`
4. Value: Your npm access token from step 2

### 4. Manual Publishing (Alternative)
```bash
cd packages/design-system
yarn npm publish --access=public
```

**Note:** You must be logged in to npm locally:
```bash
yarn npm login
```

---

## Cloudflare Pages Setup

### 1. Create Cloudflare Account
- Sign up at https://dash.cloudflare.com/sign-up

### 2. Create API Token
1. Go to https://dash.cloudflare.com/profile/api-tokens
2. Click **Create Token**
3. Use template: **Cloudflare Pages**
4. Or create custom token with permissions:
   - Zone:Read (for your domain zone)
   - Cloudflare Pages:Edit
5. Copy the token

### 3. Get Account ID
1. In Cloudflare dashboard, look at the right sidebar
2. Copy **Account ID**

### 4. Add GitHub Secrets
Add these to your GitHub repo secrets:

| Secret Name | Value |
|-------------|-------|
| `CLOUDFLARE_API_TOKEN` | Your API token from step 2 |
| `CLOUDFLARE_ACCOUNT_ID` | Your account ID from step 3 |

### 5. Create Cloudflare Pages Project
1. Go to Cloudflare dashboard → **Pages**
2. Click **Create a project**
3. Choose **Direct Upload** (we're using GitHub Actions, not direct git integration)
4. Project name: `tennis-stringing`
5. Click **Create project**

### 6. Custom Domain (Optional)
1. In your Pages project, go to **Custom domains**
2. Click **Set up a custom domain**
3. Enter your domain (e.g., `stringing.example.com`)
4. Follow DNS instructions

---

## Deployment

Both npm and Cloudflare deployments trigger automatically on push to `main`.

### npm Publishing
- Triggers when changes are made to `packages/design-system/`
- Only publishes if version is new
- Uses version in `package.json` (currently `1.0.0`)

### Cloudflare Pages
- Triggers on every push to `main`
- Deploys `sites/tennis-stringing/` directory
- URL: `https://tennis-stringing.pages.dev` (or your custom domain)

---

## Version Management

Before publishing a new version:

1. Update version in `packages/design-system/package.json`:
   ```json
   "version": "1.1.0"
   ```

2. Commit and push:
   ```bash
   git add packages/design-system/package.json
   git commit -m "Bump design-system to v1.1.0"
   git push origin main
   ```

3. GitHub Actions will auto-publish

Follow [Semantic Versioning](https://semver.org/):
- `MAJOR` (1.0.0 → 2.0.0): Breaking changes
- `MINOR` (1.0.0 → 1.1.0): New features, backward compatible
- `PATCH` (1.0.0 → 1.0.1): Bug fixes
