# stringing-static-site
Static site for Tennis stringing and customizations

## Live Site
https://vnyson.github.io

## Deployment
This site deploys automatically to GitHub Pages via GitHub Actions on every push to `main`.

## Structure
- `index.html` - Main landing page
- `css/style.css` - Styles
- `.github/workflows/deploy.yml` - CI/CD workflow

## Development
1. Make changes to files
2. Commit and push to `main`
3. GitHub Actions deploys automatically (~1-2 minutes)

## Future Migration Notes
- Currently on GitHub Pages (public repo required for free tier)
- Can migrate to Cloudflare Pages later for private repo + better performance
- Custom domain can be added to either platform
