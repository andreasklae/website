# Andreas Klæboe Portfolio Website

A modern, bilingual personal website showcasing software engineering projects and photography work.

## Features

### 🌐 Three Main Routes
- **Landing Page** (`/`) - Clean introduction with CTAs to Software & Photography
- **Software Page** (`/software`) - Dark IDE-themed showcase of programming projects and education
- **Photography Page** (`/photography`) - Light-themed gallery with highlights and photo stories

### 🎨 Design & Theming
- **Light theme** by default with clean white backgrounds
- **Dark IDE-style theme** for software pages with syntax-highlight colors
- **Subtle glassmorphism** effects on cards, buttons, and dropdowns
- **Responsive design** with mobile-first approach
- **Design tokens** for easy customization

### 🌍 Bilingual Support
- Full **Norwegian (NO) / English (EN)** language support
- Language preference saved in localStorage
- Fallback to English if translation missing
- JSON-driven content management

### ♿ Accessibility Features
- **WCAG AA** minimum contrast compliance
- **Keyboard navigation** throughout the application
- **Focus management** and visible focus indicators
- **ARIA roles** and labels where needed
- **Escape key** to close modals and lightboxes
- **Arrow key navigation** in image carousels
- **Reduced motion** support

### 📱 Interactive Components
- **Image lightboxes** with keyboard navigation
- **Photo carousels** within project cards
- **Course filtering** by tags on software page
- **Glassmorphism buttons** with hover effects
- **Story navigation** for photography series

## Tech Stack

- **React** with JavaScript (TypeScript only when it adds value)
- **Vite** for fast development and building
- **React Router** for client-side routing
- **Tailwind CSS** for styling and responsive design
- **Context API** for state management (language, theme)

## Project Structure

```
frontend/
├── src/
│   ├── components/        # Reusable UI components
│   ├── contexts/          # React contexts (Language, Theme)
│   ├── data/             # JSON data and portfolio assets
│   ├── pages/            # Main page components
│   ├── utils/            # Data utilities and helpers
│   └── hooks/            # Custom React hooks (if needed)
├── public/               # Static assets
└── ...config files
```

## Data Management

- **JSON files** are the single source of truth for content
- **Markdown files** provide context only (not extracted for display)
- **Portfolio structure** mirrors the file organization
- **Image paths** reference the data directory structure

## Development

```bash
cd frontend
npm install
npm run dev
```

The development server will start on `http://localhost:5173`

## Content Structure

### Software Projects
- Project cards with image carousels
- PDF report downloads (except Fjord Quest Adventure)
- GitHub links where available
- Detailed project pages with technical information

### Photography Stories
- Consistent story component structure
- Multi-part navigation within stories
- Highlighted photos for each part
- Full photo carousels for complete viewing

### Course Information
- Filterable by bilingual tags
- Grade display and ECTS credits
- Links to UiO course pages
- Portfolio project connections

## Future Enhancements

- [ ] Chatbot integration placeholder on landing page
- [ ] Additional photography stories
- [ ] Enhanced project technical documentation
- [ ] Performance optimizations with lazy loading
- [ ] SEO improvements and meta tags

---

Built following modern React best practices with accessibility, performance, and maintainability in mind.
