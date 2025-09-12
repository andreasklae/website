# Andreas Klæboe — Portfolio Website

A modern, bilingual (EN/NO) portfolio website showcasing software engineering projects and photography work.

## Quick Start

From the project root directory:

```bash
# Install dependencies
npm run install-deps

# Start development server
npm start
# or
npm run dev
```

The website will be available at `http://localhost:3000`

## Project Structure

```
website/
├── docs/
│   ├── ARCHITECTURE.md          # High-level overview
│   └── DEPLOYMENT.md            # GitHub Pages deployment guide
├── .github/workflows/deploy.yml # CI to GitHub Pages
├── frontend/
│   ├── public/
│   │   ├── content/             # JSON data (cv, courses, personal, photos-manifest)
│   │   ├── docs/                # PDFs (CVs, course exams, misc.)
│   │   └── portfolio/           # Images/PDFs per project/story
│   ├── src/
│   │   ├── features/
│   │   │   ├── software/        # Software route (re-export)
│   │   │   └── photography/     # Photography route + carousel wrappers
│   │   ├── components/          # Shared UI (Navbar, Footer, etc.)
│   │   ├── contexts/            # LanguageContext
│   │   ├── pages/               # Original pages (referenced by features)
│   │   └── utils/               # paths.js, data.jsx (fetch + metadata)
│   └── package.json
├── package.json                 # Workspace scripts
└── README.md
```

## Features

### Landing Page (`/`)
- Clean hero section with name and role
- Language toggle (EN/NO)
- CTAs to Software and Photography sections
- Placeholder for future chatbot integration

### Software Page (`/software`)
- **Dark IDE theme** with syntax highlighting colors
- About section from CV data
- Education timeline with date formatting
- Filterable courses with bilingual tags
- Interactive project cards with photo carousels
- PDF download functionality

### Photography Page (`/photography`)
- **Light theme** with glassmorphism effects
- Highlights grid with lightbox functionality
- Photo stories with consistent layout
- Individual story navigation with parts/chapters

## Bilingual Support

The website supports both English and Norwegian:
- Automatic browser language detection
- Persistent language preference in localStorage
- All content properly localized
- Fallback to English if translation missing

## Design System

- **Light theme** by default with clean aesthetics
- **Dark IDE theme** for software section
- **Glassmorphism** effects on cards and buttons
- **Design tokens** for easy customization
- **Responsive** grid layouts
- **Accessible** with keyboard navigation and ARIA labels

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start development server |
| `npm run dev` | Start development server (alias) |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run install-deps` | Install frontend dependencies |

## Responsive Design

The website is fully responsive and works across:
- Desktop (1200px+)
- Tablet (768px - 1199px)
- Mobile (320px - 767px)

## Accessibility

- WCAG AA contrast compliance
- Keyboard navigation support
- Screen reader friendly
- Focus management in modals
- Respects `prefers-reduced-motion`

## Deployment

### GitHub Pages (Automatic)

The website is configured for automatic deployment to GitHub Pages via GitHub Actions:

1. **Push to main/master branch** - Automatically triggers deployment
2. **GitHub Actions workflow** - Builds and deploys the site
3. **Live URL** - Available at `https://andreasklae.github.io/website/`

### Manual Deployment

To build for production:

```bash
npm run build
```

To deploy manually to GitHub Pages:

```bash
npm run deploy
```

### Configuration

- **Base path**: Dynamic — dev `/`, production `/website/`
- **GitHub Actions**: Automatic deployment on push to main
- **Build output**: `frontend/dist/` directory
- **Static hosting**: Compatible with any static hosting service

### GitHub Pages Setup

1. Go to your repository Settings → Pages
2. Set Source to "GitHub Actions"
3. The workflow will automatically deploy on push to main branch
4. Your site will be available at `https://yourusername.github.io/website/`

## Data & Assets

- **JSON files** (single source of truth): `frontend/public/content/{cv.json,courses.json,personal.json,photos-manifest.json}`
- **PDFs**: `frontend/public/docs/` (CVs and course exam PDFs)
- **Portfolio images**: `frontend/public/portfolio/`
- **Markdown** in stories provides context only; not parsed as primary data

## Customization

### Colors
Edit `frontend/tailwind.config.js` to modify the color scheme:
- Primary colors for light theme
- IDE colors for dark theme
- Accent colors for syntax highlighting

### Content
- Update JSON files under `frontend/public/content/`
- Add new portfolio projects in `frontend/src/utils/data.jsx`
- Add new images to `frontend/public/portfolio/`

---

Built with React, Tailwind CSS, and Vite.
