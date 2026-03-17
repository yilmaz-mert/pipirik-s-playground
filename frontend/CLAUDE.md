# Pipirik's Playground - Master Architecture & Portfolio Guide

## Project Overview
A polymorphic, highly scalable personal portfolio website showcasing engineering projects and interactive software experiences. Designed to support radically different visual themes (skins) with native view transitions.

## Tech Stack
- **Framework:** React 19 (using Vite)
- **Styling:** Tailwind CSS v4 (Strictly using CSS Variables/Design Tokens)
- **UI Architecture:** Polymorphic UI / Logic & Skin separation
- **Internationalization:** i18next (supports EN, TR, PL)
- **Icons:** Lucide React
- **Animations:** Framer Motion & Native View Transitions API

## Base Commands
- **Development Server:** `npm run dev`
- **Build Production:** `npm run build`
- **Lint Check:** `npm run lint`

## Documentation & Commenting Rules
- **Language Standard:** ALL code comments, documentation, and logic explanations MUST be written in **English**.
- **Consistency:** Ensure any new UI strings are added to translation JSON files.

## CRITICAL ARCHITECTURE RULES (DO NOT VIOLATE)
1. **The "My Projects" Sanctuary:**
   - Folder: `src/pages/Projects/` (except `Projects.jsx` listing logic).
   - **RULE:** NEVER modify the internal logic, state, or specific styling of individual projects (e.g., Hangman, FlightTracker, Exam). These are isolated applications and must remain unaffected by the global portfolio theme.
2. **Polymorphic UI & Theming:**
   - All global styles must be managed via CSS Variables in `src/index.css`.
   - Theme switching is handled via a lightweight `ThemeContext` injecting a `data-theme` attribute at the root level.
   - Use `document.startViewTransition()` for all theme toggles.
3. **Asset Management (Phase THREE):**
   - Heavy 3D/Canvas assets (Three.js/WebGPU) must be lazy-loaded (`React.lazy`, `Suspense`) only when their specific theme is activated.

## Folder Structure & Architecture
- `src/App.jsx`: Main routing using React Router.
- `src/context/ThemeContext.jsx`: Global theme and view transition manager.
- `src/pages/Projects/Projects.jsx`: The "Bento Grid" project showcase page (Themeable).
- `src/pages/Projects/*`: Isolated mini-apps (DO NOT TOUCH).