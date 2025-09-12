# Architecture Overview — Andreas Klæboe Portfolio Website

## Goals
- Modern, bilingual personal website for Andreas Klæboe
- Routes:
  - `/` → Landing (light theme)
  - `/software` → Studies + Projects (dark IDE theme)
  - `/photography` → Photography (light theme)
- Clean separation between data and presentation; JSON is the source of truth.

## Technology
- React 19, Vite, Tailwind CSS
- React Router v7 for routing
- GitHub Pages for hosting (via GitHub Actions)

## Structure
- `frontend/src` (application code)
  - `features/` — Feature-first grouping for scalability
    - `software/SoftwarePage.jsx` (exports the Software page)
    - `photography/` (PhotographyPage, PhotoStory, and carousel wrappers)
  - `components/` — Shared UI (Navbar, Footer, PageTransition, LanguageToggle, etc.)
  - `contexts/` — LanguageContext with `getText` helper
  - `utils/` — `paths.js` (asset/base handling), `data.jsx` (loaders + project metadata)
  - `pages/` — Original pages kept; features import these (progressive migration)
- `frontend/public` (static assets)
  - `content/` — JSON data (cv.json, courses.json, personal.json, photos-manifest.json)
  - `docs/` — PDFs (CVs, exams, reports/awards where not project-scoped)
  - `portfolio/` — Images and PDFs grouped per project/story
- `docs/` (repo documentation)
  - `DEPLOYMENT.md` — Deployment guide
  - `ARCHITECTURE.md` — This document
- `.github/workflows/deploy.yml` — GitHub Pages pipeline

## Data Model
- JSON in `frontend/public/content` is the single source of truth for structured content:
  - `cv.json` (education, experience, contacts)
  - `courses.json` (course list with optional `pdfExam`)
  - `personal.json` (light personal details)
  - `photos-manifest.json` (image lists per software project)
- Markdown files in photography stories (e.g. `description.md`) explain context, not data.

## Paths & Assets
- All static paths go through `getAssetPath` (`frontend/src/utils/paths.js`)
  - Uses Vite’s `import.meta.env.BASE_URL`
  - Dev base `/`, production base `/website/` (configured in `vite.config.js`)
- This ensures JSON, images, and PDFs resolve both locally and on GitHub Pages.

## Photography Stories
- Consistent structure per story under `frontend/public/portfolio/photography/...`
  - Each part contains `description.md`, `highlights/`, and `photos/`
- UI: `PhotographyPage` (highlights + stories) → `PhotoStory` (parts navigation + carousels)

## Accessibility & UX
- Tailwind utilities for accessible color contrast
- Keyboard/trap focus in `ImageCarousel` (escape, arrows, tab trapping)
- Respects `prefers-reduced-motion`

## Deployment
- GitHub Actions build and deploy to GitHub Pages
- Vite base: dev `/`, prod `/website/`

## Notes
- Prefer kebab-case for asset names and consistent directory casing (e.g., `highlights/`)
- Consider Git LFS for large binaries (PDFs/photos) if repository size becomes a concern

