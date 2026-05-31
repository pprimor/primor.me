This project is a personal website built with Vite, React, and Tailwind CSS.

## Development

```bash
npm run lint
npm run typecheck
npm run build
```

Pull requests and pushes to `main` run lint, typecheck, and build via GitHub Actions. Only merges to `main` (and manual workflow runs) deploy to Cloudflare Pages.

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
