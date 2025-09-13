# GitHub Pages Deployment Guide

## Automatic Deployment

Configured via GitHub Actions to build and deploy on push to `main`/`master`.
- Node 20, npm cache for speed
- Builds the Vite app from `frontend/`
- Publishes `frontend/dist` to GitHub Pages

Workflow: `.github/workflows/deploy.yml`

## Base Path
- Development: `/` (localhost)
- Production: `/` (custom domain: https://www.andreasklaeboe.com)
- Alternate: If hosting under a subpath (e.g. `https://username.github.io/website/`), build with `VITE_BASE_URL=/website/`

Vite config uses `base: process.env.VITE_BASE_URL || '/'` so root is default.

## SPA Routing
- `frontend/public/404.html` and an inline script in `frontend/index.html` handle refresh/deep links
- React Router manages client-side routing
  - In `frontend/public/404.html`, `pathSegmentsToKeep` is set to `0` for a custom domain at root. Use `1` if hosting under a `/repo` subpath.

## Manual Commands
- Build: `npm run build`
- Preview build: `npm run preview`
- Local dev: `npm start` (or `npm run dev`)

## Custom Domain
- `frontend/public/CNAME` ensures GitHub Pages serves at `www.andreasklaeboe.com`.
- In repo Settings → Pages, set the Custom domain to `www.andreasklaeboe.com` and verify DNS.

## Troubleshooting
- If links 404 in production, ensure:
  - `vite.config.js` base is `/` (or `VITE_BASE_URL` matches your subpath)
  - All asset URLs go through `getAssetPath`
- If images/PDFs fail locally, restart dev server after config changes
- Review the Actions logs in the "Actions" tab when deployments fail
