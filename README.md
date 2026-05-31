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
cp .dev.vars.example .dev.vars   # add RESEND_API_KEY + TURNSTILE_SECRET_KEY
cp .env.example .env             # optional: VITE_TURNSTILE_SITE_KEY for the widget
npm run dev                      # terminal 1 → Vite on :5173
npm run dev:full                 # terminal 2 → Wrangler Pages + Functions on :8788
```

Open **http://localhost:8788** (not 5173) so `/api/contact` hits the local Function.

Variables from [`.dev.vars.example`](.dev.vars.example) and [`.env.example`](.env.example):

| Variable | File | Required | Purpose |
|----------|------|----------|---------|
| `RESEND_API_KEY` | `.dev.vars` | Yes (for send) | Resend API key |
| `CONTACT_TO_EMAIL` | `.dev.vars` | No | Inbox (default `hello@primor.me`) |
| `RESEND_FROM_EMAIL` | `.dev.vars` | No | From header (default in code) |
| `TURNSTILE_SECRET_KEY` | `.dev.vars` | Yes (for `dev:full`) | Server-side Turnstile verify |
| `VITE_TURNSTILE_SITE_KEY` | `.env` | No | Client widget (hidden if unset) |

For local Turnstile testing, use Cloudflare [test keys](https://developers.cloudflare.com/turnstile/troubleshooting/testing/):

- Site key: `1x00000000000000000000AA` (always passes)
- Secret: `1x0000000000000000000000000000000AA`
- Dummy response token: `1x000000000000000000000000AA`

`.dev.vars` and `.env` are gitignored; never commit secrets.

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
| `TURNSTILE_SECRET_KEY` | Pages env (Production + Preview) | Turnstile siteverify |
| `VITE_TURNSTILE_SITE_KEY` | GitHub Actions secret | Turnstile widget on deploy build |
| `VITE_CF_WEB_ANALYTICS_TOKEN` | GitHub Actions secret | Analytics beacon on deploy build |
| `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID` | GitHub Actions secrets | `wrangler pages deploy` |

### Contact form hardening (Turnstile + KV)

The contact API layers **origin allowlist**, **honeypot**, **Turnstile**, and **KV rate limiting** (5 submissions per IP per hour) before calling Resend.

#### Cloudflare dashboard (one-time)

1. **Turnstile** → create a widget for `primor.me` (Managed mode recommended). Copy the **site key** (build-time) and **secret key** (Pages env).
2. **KV** — create the rate-limit namespace (requires `CLOUDFLARE_API_TOKEN` locally):

   ```bash
   npx wrangler kv namespace create CONTACT_RATE_LIMIT
   npx wrangler kv namespace create CONTACT_RATE_LIMIT --preview
   ```

   Paste the returned `id` and `preview_id` into [`wrangler.toml`](wrangler.toml) (`CONTACT_RATE_LIMIT` binding).
3. **Pages** → project `primor-me` → **Settings → Functions**:
   - Bind KV namespace `CONTACT_RATE_LIMIT` to the namespace above.
   - Add `TURNSTILE_SECRET_KEY` for Production and Preview (same vars as Resend).

4. **GitHub** → repository secret `VITE_TURNSTILE_SITE_KEY` (site key from step 1).

Rate limits apply per IP (`CF-Connecting-IP`). Users behind shared NAT may share a cap; acceptable for a personal portfolio.

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

[`scripts/capture-project-screenshots.mjs`](scripts/capture-project-screenshots.mjs) regenerates light/dark PNGs for portfolio projects under `public/images/` (880×660), then runs [`scripts/optimize-images.mjs`](scripts/optimize-images.mjs) to produce WebP and AVIF variants.

**Targets:** live `https://primor.me/` and `https://igcp-aforro.primor.me/`.

Playwright is not in `package.json`; install once:

```bash
npm install -D playwright   # optional: add to repo later
npx playwright install chromium
```

**Run:**

```bash
node scripts/capture-project-screenshots.mjs   # capture + optimize (chained)
# or regenerate variants only:
npm run optimize:images
```

**Outputs:** For each basename (`website-light`, `website-dark`, `igcp-aforro-light`, `igcp-aforro-dark`, plus `me` and `final-cut-pro-preview`), committed assets are `.png`, `.webp`, and `.avif` under `public/images/`. Project paths in [`src/lib/data.ts`](src/lib/data.ts) use extensionless base paths; [`OptimizedImage`](src/components/OptimizedImage.tsx) serves AVIF/WebP with PNG fallback.

Requires network access to production URLs for capture; commit updated images when refreshing the portfolio. One-time `npm install` pulls `sharp` (devDependency) for maintainers regenerating assets — CI does not run Sharp.

## Deployment

- Push to `main` → Actions `check` then `deploy` to Cloudflare Pages project `primor-me`
- Pull requests → `check` only
- Manual: `workflow_dispatch` in GitHub Actions
- Functions under `functions/` deploy automatically with Pages
- Unknown paths serve the custom `404.html` with HTTP **404** (built from the second Vite entry). Do not re-add `/* /index.html 200` to [`public/_redirects`](public/_redirects) unless you introduce client-side routing; hash links (`/#contact`) still load `/` first.

## Project layout

```
App.tsx, main.tsx     # entry
src/components/       # UI sections
src/lib/data.ts       # content (projects, experience, skills)
functions/api/        # contact handler
public/images/        # static assets + project screenshots
```
