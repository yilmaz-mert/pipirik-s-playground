# Pipirik's Playground - Master Architecture & Portfolio Guide

## Project Overview
A polymorphic, highly scalable personal portfolio website showcasing engineering projects. Currently evolving into Phase 10: "Performance Optimization & The Living UI".

## Tech Stack
- **Framework:** React 19 (using Vite)
- **Styling:** Tailwind CSS v4 (Strictly using CSS Variables/Design Tokens)
- **Animations:** Framer Motion (Advanced hooks: useSpring, useTransform for 3D/Fisheye) & Native View Transitions
- **Graphics:** Canvas/WebGL for background simulations
- **Internationalization:** i18next
- **Sensory & OS UI:** `use-sound` (for Sonic UI), `cmdk` (for Command Palette)

## Visual Truth (Design Tokens)
- **Base/Background:** Deep Charcoal Grey (`#0A0A0B`)
- **Surface:** Dark Slate (`#161618`)
- **Accent:** Digital Lavender (`#B57EDC`)
- **UI Paradigms:** Bottom Floating Dock (macOS fisheye style), Extreme Glassmorphism (`backdrop-blur-3xl`), 3D Perspective Tilt on cards.

## Base Commands
- **Development Server:** `npm run dev`
- **Build Production:** `npm run build`
- **Lint Check:** `npm run lint`

## CRITICAL ARCHITECTURE RULES (DO NOT VIOLATE)

1. **The "My Projects" Sanctuary:**
   - Folder: `src/pages/Projects/` (except the `Projects.jsx` listing logic).
   - **RULE:** NEVER modify the internal logic, state, or styling of individual projects (e.g., Hangman, FlightTracker, Exam). They are completely isolated.

2. **Performance & Asset Management:**
   - Heavy assets (like Canvas Fluid Simulations) MUST be lazy-loaded via `Suspense` and `React.lazy` and restricted to specific routes (e.g., `/` only) using `useLocation`.
   - Aim for strict 60fps. Always use GPU-accelerated CSS properties (`transform`, `opacity`).

3. **Data Visualization Performance (Grid/Heatmaps):**
   - When rendering large grids (like GitHub Heatmaps), NEVER animate hundreds of individual DOM nodes simultaneously with Framer Motion. This causes severe FPS drops.
   - **Rule:** Animate containers (stagger columns/rows) or use SVG/Canvas for massive data plots. 

4. **Dynamic Component Masking (The "Swiss Cheese" Rule):**
   - Background effects MUST NEVER render behind key UI components (Hero, Profile, Skills, etc.).
   - **RULE:** Do NOT use physical overlay divs for shielding. This kills glassmorphism and shadows. 
   - **Solution:** Use the `mask-image` property on the canvas elements. Generate a dynamic SVG mask that contains "holes" (black rectangles) exactly at the coordinates of the registered UI components. This creates a "Swiss Cheese" effect where the background simulation is visible everywhere EXCEPT behind the UI.

5. **Raycast-Style CMDK (Command Palette):**
   - Command palettes must NOT look like generic web dropdowns. 
   - They must resemble native OS apps (like Raycast): massive padding, 3xl blur, invisible inputs, typography-driven UI, and zero clunky background fills. Globally reserved shortcut: `CMD+K` / `CTRL+K`.

6. **The Sensory Layer (Sonic UI):**
   - UI sounds must be extremely subtle (short decay, low volume). Never block the main thread.
   - Respect browser auto-play policies (sounds trigger on interaction only).

7. **External APIs & Data Fetching:**
   - When fetching live data (e.g., GitHub contributions), ALWAYS use a robust public proxy (like Deno proxies) to bypass CORS/Auth limitations.
   - Parse schemas strictly. Always implement elegant loading states (skeletons) and graceful fallbacks if the API fails, ensuring the UI never breaks.

8. **Engineer Mode:**
   - A global toggle that adds technical metadata to the UI using CSS pseudo-elements (do NOT bloat the DOM with extra wrapper divs for this mode). Must apply to all routes and sub-components.