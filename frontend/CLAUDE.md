# Pipirik's Playground - Master Architecture & Portfolio Guide

## Project Overview
A polymorphic, highly scalable personal portfolio website showcasing engineering projects. Currently evolving into "Cyber-Naturalism" & Digital OS Experience.

## Tech Stack
- **Framework:** React 19 (using Vite)
- **Styling:** Tailwind CSS v4 (Strictly using CSS Variables/Design Tokens)
- **Animations:** Framer Motion (Advanced hooks: useSpring, useTransform for 3D/Fisheye) & Native View Transitions
- **Graphics:** Canvas/WebGL for background simulations
- **Sensory & OS UI:** `use-sound` (Sonic UI), `cmdk` (Command Palette)

## Base Commands
- **Dev:** `npm run dev`
- **Build:** `npm run build`
- **Lint:** `npm run lint`

---

## 🧠 AUTONOMOUS AGENT BEHAVIORS (STAFF ENGINEER LEVEL)

### 1. Plan Node Default
- Enter plan mode for ANY non-trivial task (3+ steps or architectural decisions).
- If something goes sideways, STOP and re-plan immediately - don't keep pushing.
- Use plan mode for verification steps, not just building.
- Write detailed specs upfront to reduce ambiguity.

### 2. Subagent Strategy
- Use subagents liberally to keep main context window clean.
- Offload research, exploration, and parallel analysis to subagents.
- One task per subagent for focused execution.

### 3. Verification Before Done
- Never mark a task complete without proving it works.
- Diff behavior between main and your changes when relevant.
- Ask yourself: "Would a staff engineer approve this?"
- Run tests, check logs, demonstrate correctness.

### 4. Demand Elegance & Simplicity
- For non-trivial changes: pause and ask "Is there a more elegant way?"
- If a fix feels hacky: "Knowing everything I know now, implement the elegant solution."
- **Simplicity First:** Make every change as simple as possible. Impact minimal code. Find root causes. No temporary fixes.

### 5. Task Management
1. **Plan First:** Write plan to `tasks/todo.md` with checkable items.
2. **Verify Plan:** Check in before starting implementation.
3. **Track Progress:** Mark items complete as you go.
4. **Document Results:** Add review section to `tasks/todo.md`.
5. **Capture Lessons:** Update `tasks/lessons.md` after corrections.

---

## 🏗️ CRITICAL ARCHITECTURE RULES (DO NOT VIOLATE)

1. **The "My Projects" Sanctuary:**
   - Folder: `src/pages/Projects/` (except the `Projects.jsx` listing logic).
   - NEVER modify the internal logic, state, or styling of individual projects (Hangman, FlightTracker, Exam). They are completely isolated.

2. **Data Visualization Performance (Grid/Heatmaps):**
   - When rendering large grids, NEVER animate hundreds of individual DOM nodes simultaneously with Framer Motion. Animate containers or use SVG/Canvas.

3. **Background & Layering Strategy (No Masking):**
   - Background effects (Fluid, X-Ray, Neon) MUST render at their native opacity in the background layer (`z-index: 0` or `1`).
   - UI components stay on top with high-quality glassmorphism and clear contrast.
   - Do NOT use complex CSS/SVG masks or filters for component shielding. The backgrounds must run full-screen, unfiltered.

4. **Raycast-Style CMDK (Command Palette):**
   - Must resemble native OS apps (like Raycast): massive padding, 3xl blur, invisible inputs, typography-driven UI, zero clunky backgrounds.

5. **External APIs & Data Fetching:**
   - ALWAYS use a robust public proxy (like Deno proxies) to bypass CORS.
   - Implement elegant loading states (skeletons) and graceful fallbacks.

6. **Event Listener & State Performance:**
   - High-frequency events (mousemove, scroll) MUST NOT trigger React state updates. Use `useMotionValue` or raw DOM refs to prevent UI lagging.