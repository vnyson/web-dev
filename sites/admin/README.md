# Tennis Admin System

Admin dashboard for tennis stringing services, built with Astro and Tailwind CSS, backed by Cloudflare D1 database.

## 🚀 Setup

### Prerequisites
- Node.js 20+
- Yarn 4.5.0
- Cloudflare account with API token
- Wrangler CLI installed globally

### Database Setup

1. **Create Cloudflare D1 database:**
   ```bash
   cd workers/api
   yarn d1:create
   ```
   This will create a database and output a database ID. Update `workers/api/wrangler.toml` with the database ID.

2. **Run migrations:**
   ```bash
   cd workers/api
   yarn d1:migrate
   ```

3. **Seed data (optional):**
   ```bash
   cd db/seed
   node seed.js > seed.sql
   cd ../../workers/api
   wrangler d1 execute tennis-admin-db --local --file=../../db/seed/seed.sql
   ```

### Workers API Setup

1. **Install dependencies:**
   ```bash
   cd workers/api
   yarn install
   ```

2. **Run locally:**
   ```bash
   yarn dev
   ```
   The API will be available at `http://localhost:8787`

3. **Deploy to Cloudflare:**
   ```bash
   yarn deploy
   ```

### Admin App Setup

1. **Install dependencies:**
   ```bash
   cd sites/admin
   yarn install
   ```

2. **Run locally:**
   ```bash
   yarn dev
   ```
   The admin app will be available at `http://localhost:4321`

3. **Build for production:**
   ```bash
   yarn build
   ```

4. **Preview production build:**
   ```bash
   yarn preview
   ```

## 📁 Project Structure

```
web-dev/
├── sites/
│   ├── tennis-stringing/     # Static public site
│   └── admin/                # Admin dashboard (Astro)
│       ├── src/
│       │   ├── pages/        # Astro pages
│       │   ├── lib/          # API client
│       │   └── styles/       # Global CSS
│       └── package.json
├── workers/
│   └── api/                  # Cloudflare Workers API
│       ├── src/
│       │   └── index.ts      # API endpoints
│       └── wrangler.toml
└── db/
    ├── migrations/           # D1 database migrations
    └── seed/                 # Seed data scripts
```

## 🧞 Commands

### Admin App (sites/admin)
| Command | Action |
|---------|--------|
| `yarn install` | Install dependencies |
| `yarn dev` | Start local dev server at `localhost:4321` |
| `yarn build` | Build production site to `./dist/` |
| `yarn preview` | Preview build locally |

### Workers API (workers/api)
| Command | Action |
|---------|--------|
| `yarn install` | Install dependencies |
| `yarn dev` | Start local dev server at `localhost:8787` |
| `yarn deploy` | Deploy to Cloudflare Workers |
| `yarn d1:create` | Create D1 database |
| `yarn d1:migrate` | Run database migrations |

## 🔧 Configuration

### Environment Variables

Set the following environment variable for the admin app:

- `PUBLIC_API_URL`: URL of the Workers API (default: `http://localhost:8787`)

### Cloudflare Secrets

Add these secrets to your Cloudflare Workers project:

- `CLOUDFLARE_API_TOKEN`: Your Cloudflare API token
- `CLOUDFLARE_ACCOUNT_ID`: Your Cloudflare account ID

## 📊 Features

- **Dashboard**: Overview of active jobs, inventory items, and players
- **Inventory Management**: Track strings, grips, and demo rackets
- **Jobs Tracker**: Manage stringing jobs with status workflow
- **Player Profiles**: Manage customer information and preferences
- **New Drop Off**: Quick form for creating new stringing jobs

## 🚀 Deployment

The project uses GitHub Actions for automatic deployment:

- **Static site**: Deployed to Cloudflare Pages on push to main
- **Admin app**: Deployed to Cloudflare Pages on push to main (when admin files change)
- **Workers API**: Deployed to Cloudflare Workers on push to main (when workers files change)

Configure the following secrets in your GitHub repository:
- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`
