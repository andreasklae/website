# Cursor Master Prompt — Andreas Klæboe Portfolio Website

## Goal
Build a modern, bilingual personal website for **Andreas Klæboe** with three main routes:

- `/` → Landing page (light theme, clean intro, CTAs to Software & Photography)  
- `/software` → Software Engineering / Programming page (IDE-style dark theme, includes education, courses, projects)  
- `/photography` → Photography page (light theme, with highlights and stories)

The website should also have a footer

Cursor should analyze the current repo to locate JSONs, Markdown files, images, and other content.  
JSON files are always the **single source of truth** for structured content.  
Markdown files are **not sources of content** — they are there only to give Cursor context about what to display and how to structure it. Do not extract user-facing text from Markdown.  

---

## Theming & Style

### Global
- Default **light theme** with clean white background.  
- **Glassmorphism is subtle and component-only** (cards, buttons, dropdowns). No frosted page backgrounds.  
- Provide design tokens for colors and spacing so they can be easily changed later.  
- Maintain WCAG AA minimum contrast.  

### Software Page (`/software`)
- **Dark IDE-style theme** with syntax-highlight accents (purple, blue, orange).  
- Decorative code symbols (`{}`, `[]`, `<>`, `//`) allowed in headings and dividers.  
- Glassmorphism still allowed on buttons/cards, but subtle.  

### Photography Page (`/photography`)
- **Light theme**.  
- Glassmorphism only on cards and buttons.  
- **Stories must look consistent**: all stories use the same components and layout, only content differs.  

---

## Page Requirements

### Landing Page (`/`)
- Minimal hero: name, role, short text.  
- Two clear CTAs: → “Software { }” and → “Photography ⟡”.  
- Language toggle (EN/NO).  
- Leave a placeholder for a chatbot (not implemented yet).  

### Software Page (`/software`)
- Sections:
  1. **About as Engineer** (from JSON CV summary).  
  2. **Education** (from JSON CV, including months).  
  3. **Courses** (from JSON courses; filterable by bilingual tags) there are some placholders in this JSON for some courses that should link to the portfolio. change the placeholders in the json to refer to the relevant portfolio page.  
  4. **Projects** (from JSON + metadata, minimal grid of project cards).  

- Projects should be **simple**: each shown as a card with title, description, tags, and optional links. Clicking can open either a modal or a separate route — keep it minimal. Each project has photos attatched, add functionality to view these photos in the browser with a carousel inside the cards.
- Each project card should include a **download button for PDF reports** (except Fjord Quest Adventure, which should have a "Visit Website" button that navigates to its webpage instead).

### Photography Page (`/photography`)
- Sections:
  1. **Highlights**: grid of best single photos; click → lightbox (keyboard accessible).  
  2. **Stories**: card layout, each card shows a cover + title. Click → navigate into full story with chapters/parts structure. A simple arrow back can navigate back to the cards. 
     - Each story contains **subfolders acting as chapters/parts**
     - Each chapter/part structure:
       1. **Text description** (from subfolder description file)
       2. **Highlighted photos** (2-4 key images displayed prominently)
       3. **Photo carousel** (all photos from that chapter/part)
       4. Navigation to next part
     - Subfolder organization per story:
       - `/story-name/part-1/` → contains `description.md` + `/highlights/` (2-4 images) + `/photos/` (all images)
       - `/story-name/part-2/` → same structure
       - etc.
     - All stories must be visually consistent — same components, different content. For now there is only one, but I will add more later 

---

## Functionality Rules
- **Bilingual support (EN/NO)** everywhere. Fallback to English if translation missing.  
- JSON content is always the source for text (personal info, CV, courses, etc.).  
- Markdown files are for context only, not for extracting visible text.  
- Photography stories must share a **common React component structure**, not one-off layouts.  

---

## Tech & Implementation
- Build with **React**.  
- Use a **CSS framework** (Tailwind or similar) for styling.  
- Use **JavaScript by default**, TypeScript only when it adds value.  
- Keep the codebase modular and maintainable.  
- Provide clean separation between data and presentation.  

---

## Accessibility & Performance
- Keyboard navigable, visible focus, ARIA roles where needed.  
- Lightbox and modals: escape to close, focus trap, arrow keys for navigation.  
- Responsive, lazy-loaded images with `srcset`/sizes.  
- Respect `prefers-reduced-motion`.  

---

## Placeholders
- Leave placeholders for portfolio links in courses where needed.  
- Leave a placeholder for chatbot integration on landing page.  
- Provide sensible defaults if metadata is missing.  

---
