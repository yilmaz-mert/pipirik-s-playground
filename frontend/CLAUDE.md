# Pipirik's Playground - Master Architecture & Portfolio Guide

## Project Overview
A polymorphic, highly scalable personal portfolio website showcasing engineering projects. Currently evolving into Phase 4: "Cyber-Naturalism" & Digital OS Experience.

## Tech Stack
- **Framework:** React 19 (using Vite)
- **Styling:** Tailwind CSS v4 (Strictly using CSS Variables/Design Tokens)
- **Animations:** Framer Motion (Advanced hooks: useSpring, useTransform for 3D/Fisheye) & Native View Transitions
- **Graphics:** Canvas/WebGL for background simulations
- **Internationalization:** i18next

## Base Commands
- **Development Server:** `npm run dev`
- **Build Production:** `npm run build`
- **Lint Check:** `npm run lint`

## CRITICAL ARCHITECTURE RULES (DO NOT VIOLATE)
1. **The "My Projects" Sanctuary:**
   - Folder: `src/pages/Projects/` (except `Projects.jsx` listing logic).
   - **RULE:** NEVER modify the internal logic, state, or styling of individual projects (e.g., Hangman, FlightTracker, Exam). They are completely isolated.
2. **Polymorphic UI & Cyber-Naturalism:**
   - Base tokens: Deep Charcoal Grey (`#0A0A0B`), Dark Slate Surface (`#161618`), Digital Lavender Accent (`#B57EDC`).
   - UI Paradigms: Bottom Floating Dock (macOS fisheye style), Glassmorphism, 3D Perspective Tilt on cards.
3. **Performance & Asset Management:**
   - Heavy assets (like Canvas Fluid Simulations) MUST be lazy-loaded via `Suspense` and `React.lazy`.
   - Aim for 60fps; use GPU-accelerated CSS properties (`transform`, `opacity`).
4. **Engineer Mode:**
   - A global toggle that adds technical metadata to the UI using CSS pseudo-elements (do NOT bloat the DOM with extra wrapper divs for this mode).