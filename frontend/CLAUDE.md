# Pipirik's Playground - Portfolio Project Guide

## Project Overview
A personal portfolio website showcasing Electrical-Electronics Engineering projects and interactive software experiences.

## Tech Stack
- **Framework:** React 18+ (using Vite)
- **UI Library:** HeroUI (formerly NextUI)
- **Styling:** Tailwind CSS
- **Internationalization:** i18next (supports EN, TR, PL)
- **Icons:** Lucide React
- **Animations:** Framer Motion

## Base Commands
- **Development Server:** `npm run dev`
- **Build Production:** `npm run build`
- **Lint Check:** `npm run lint`

## Documentation & Commenting Rules
- **Language Standard:** ALL code comments, documentation, and logic explanations MUST be written in **English**.
- **Consistency:** Ensure any new UI strings are added to both `en/translation.json` and `tr/translation.json`.

## Folder Structure & Architecture
- `src/App.jsx`: Main routing using React Router (Lazy Loading enabled).
- `src/pages/Projects/Projects.jsx`: The "Bento Grid" project showcase page.
- `src/pages/Projects/`: Individual project components (e.g., `Hangman`, `FlightTracker`).
- `public/locales/`: i18n translation files.

## Development & Expansion Guidelines
1. **Adding New Projects:**
   - Update `projectList` in `Projects.jsx` with unique ID, title, tech stack, and color gradient.
   - Add corresponding keys to `translation.json` files for multilingual support.
   - Ensure the project card uses a Lucide icon as both a header icon and a decorative background element.
2. **UI Standards:**
   - Use HeroUI `Card`, `CardHeader`, `CardBody`, and `Chip` components for consistency.
   - Apply the glassmorphism style (`backdrop-blur-xl`, `bg-[#1e293b]/50`) to new cards.
3. **Routing:** Always use Lazy Loading for new project pages in `App.jsx` to maintain performance.