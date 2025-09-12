# GitHub Pages Deployment Guide

## Automatic Deployment

Configured via GitHub Actions to build and deploy on push to `main`/`master`.
- Node 20, npm cache for speed
- Builds the Vite app from `frontend/`
- Publishes `frontend/dist` to GitHub Pages

Workflow: `.github/workflows/deploy.yml`

## Base Path
- Development: `/` (localhost)
- Production: `/website/` (GitHub Project Pages)
- Vite uses dynamic base: `/` when serving, `/website/` on build

## SPA Routing
- `frontend/public/404.html` and an inline script in `frontend/index.html` handle refresh/deep links
- React Router manages client-side routing

## Manual Commands
- Build: `npm run build`
- Preview build: `npm run preview`
- Local dev: `npm start` (or `npm run dev`)

## Troubleshooting
- If links 404 in production, ensure:
  - `vite.config.js` base switches per env
  - All asset URLs go through `getAssetPath`
- If images/PDFs fail locally, restart dev server after config changes
- Review the Actions logs in the "Actions" tab when deployments fail

