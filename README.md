# primor.me

Personal portfolio site — a React SPA built with Vite.

**Live:** https://primor.me

## Stack

- **Frontend:** Vite, React 18, TypeScript, Tailwind CSS, Framer Motion
- **Hosting:** Cloudflare Pages (static `dist/`)
- **API:** Cloudflare Pages Function at `/api/contact` ([`functions/api/contact.ts`](functions/api/contact.ts)) → [Resend](https://resend.com) for email
- **CI/CD:** GitHub Actions ([`.github/workflows/vite.yml`](.github/workflows/vite.yml))

## Prerequisites

- **Node.js 22** (matches CI `node-version`)
- **npm** (lockfile: `package-lock.json` → use `npm ci`)

## Getting started

```bash
npm ci
npm run dev          # Vite only → http://localhost:5173
npm run preview      # after build
```

`npm run dev` does **not** run the contact API; form POSTs to `/api/contact` will fail unless you use the full stack below.

## Local development with contact API

```bash
cp .dev.vars.example .dev.vars   # add real RESEND_API_KEY
npm run dev:full                 # Wrangler proxies Vite + Functions
```

Variables from [`.dev.vars.example`](.dev.vars.example):

| Variable | Required | Purpose |
|----------|----------|---------|
| `RESEND_API_KEY` | Yes | Resend API key |
| `CONTACT_TO_EMAIL` | No | Inbox (default `hello@primor.me`) |
| `RESEND_FROM_EMAIL` | No | From header (default in code) |

`.dev.vars` is gitignored; never commit secrets.

## Development

```bash
npm run dev          # Vite dev server (http://localhost:5173)
npm run dev:full     # Vite + Pages Functions via Wrangler
npm run preview      # preview production build locally
npm run lint
npm run typecheck
npm run build
```

Pull requests and pushes to `main` run lint, typecheck, and build via GitHub Actions. Only merges to `main` (and manual workflow runs) deploy to Cloudflare Pages.

## Environment variables and secrets

### Local / build (optional)

| File | Used for |
|------|----------|
| [`.env.example`](.env.example) | Copy to `.env` if needed; `VITE_CF_WEB_ANALYTICS_TOKEN` for local production builds |
| [`.dev.vars.example`](.dev.vars.example) | Copy to `.dev.vars` for `dev:full` |

### Production

| Secret / setting | Where | Used for |
|------------------|-------|----------|
| `RESEND_API_KEY` | Cloudflare Pages → Settings → Environment variables | Contact API |
| `CONTACT_TO_EMAIL`, `RESEND_FROM_EMAIL` | Same (optional) | Contact overrides |
| `VITE_CF_WEB_ANALYTICS_TOKEN` | GitHub Actions secret | Analytics beacon on deploy build |
| `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID` | GitHub Actions secrets | `wrangler pages deploy` |

## Analytics

Traffic is measured with [Cloudflare Web Analytics](https://developers.cloudflare.com/analytics/web-analytics/) (cookieless JavaScript beacon).

### Cloudflare setup

1. In the Cloudflare dashboard, open **Analytics & Logs → Web Analytics** for the account that owns `primor.me`.
2. **Add a site** → `primor.me` (or select the existing zone).
3. Choose **Enable with JavaScript** and copy the `token` value from the `data-cf-beacon` attribute in the snippet.

### Production builds

Add the token as a GitHub Actions repository secret named `VITE_CF_WEB_ANALYTICS_TOKEN` (Settings → Secrets and variables → Actions). Production deploys inject the beacon at build time; builds without the secret stay analytics-free.

### Local verification

The dev server does not load analytics unless the env var is set. To check a production build locally:

```bash
VITE_CF_WEB_ANALYTICS_TOKEN=<your-token> npm run build && npm run preview
```

Inspect page source in `dist/index.html` and confirm the `beacon.min.js` script is present. Visits appear in the Cloudflare Web Analytics dashboard within ~30 minutes (not real-time).

## Project screenshots

[`scripts/capture-project-screenshots.mjs`](scripts/capture-project-screenshots.mjs) regenerates light/dark PNGs for portfolio projects under `public/images/` (880×660).

**Targets:** live `https://primor.me/` and `https://igcp-aforro.primor.me/`.

Playwright is not in `package.json`; install once:

```bash
npm install -D playwright   # optional: add to repo later
npx playwright install chromium
```

**Run:**

```bash
node scripts/capture-project-screenshots.mjs
```

**Outputs:** `website-light.png`, `website-dark.png`, `igcp-aforro-light.png`, `igcp-aforro-dark.png` (paths referenced in [`src/lib/data.ts`](src/lib/data.ts)).

Requires network access to production URLs; commit updated images when refreshing the portfolio.

## Deployment

- Push to `main` → Actions `check` then `deploy` to Cloudflare Pages project `primor-me`
- Pull requests → `check` only
- Manual: `workflow_dispatch` in GitHub Actions
- Functions under `functions/` deploy automatically with Pages

## Project layout

```
App.tsx, main.tsx     # entry
src/components/       # UI sections
src/lib/data.ts       # content (projects, experience, skills)
functions/api/        # contact handler
public/images/        # static assets + project screenshots
```
