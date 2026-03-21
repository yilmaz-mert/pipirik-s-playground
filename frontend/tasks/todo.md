# Phase 18 — The Great Masking Purge & Code Cleanup

## Status: IN PROGRESS

---

## Scope

7 changes, in dependency order (delete context last — after all consumers are clean):

| # | File | Action |
|---|------|--------|
| 1 | `src/index.css` | Remove `.bg-canvas-wrap` block + media query |
| 2 | `src/themes/cyber-naturalism/FluidBackground.jsx` | Remove wrapper div, `registerCanvas` useEffect, `usePrecisionShield` import |
| 3 | `src/themes/neon-monochrome/NeonAscii.jsx` | Same as above |
| 4 | `src/components/SunsetDecoder/SunsetDecoder.jsx` | Remove `bg-canvas-wrap` wrapper div |
| 5 | `src/pages/Home/Home.jsx` | Remove `usePrecisionShield`, `gridRef`, `register` useEffect, `useRef`/`useEffect` imports |
| 6 | `src/App.jsx` | Remove `PrecisionShieldProvider` import + JSX wrapper |
| 7 | `src/context/PrecisionShieldContext.jsx` | **Delete file entirely** |

Post-change: `npm run build` to confirm zero broken imports.

---

## Tasks

### 1 — index.css: Remove Canvas Fade block ✅
- [x] Remove the `/* CANVAS FADE — "Left Dissolve" */` comment block
- [x] Remove `.bg-canvas-wrap { … }` declaration
- [x] Remove `@media (max-width: 1023px) { .bg-canvas-wrap { … } }`
- [x] Remove the now-stale "CANVAS BACKGROUND MASK Phase 12" comment block below it

### 2 — FluidBackground.jsx: Strip masking ✅
- [x] Remove `import { usePrecisionShield } from '../../context/PrecisionShieldContext'`
- [x] Remove `const { registerCanvas } = usePrecisionShield()`
- [x] Remove `useEffect(() => registerCanvas(canvasRef), [registerCanvas])`
- [x] Remove wrapper `<div className="bg-canvas-wrap">` — restore clean `<canvas>` return
- [x] Restore `aria-hidden="true"` and `zIndex: 0` on canvas element directly

### 3 — NeonAscii.jsx: Strip masking ✅
- [x] Same three removals as FluidBackground

### 4 — SunsetDecoder.jsx: Remove wrapper div ✅
- [x] Remove `<div className="bg-canvas-wrap" … >` wrapper
- [x] Restore `zIndex: 1` on the `<pre>` element's inline style

### 5 — Home.jsx: Remove shield registration ✅
- [x] Remove `import { usePrecisionShield }`
- [x] Remove `useRef` and `useEffect` from React import (now unused)
- [x] Remove `const gridRef = useRef(null)`
- [x] Remove `const { register } = usePrecisionShield()`
- [x] Remove `useEffect(() => register('home-grid', gridRef), [register])`
- [x] Remove `ref={gridRef}` from the grid div

### 6 — App.jsx: Remove Provider ✅
- [x] Remove `import { PrecisionShieldProvider } from './context/PrecisionShieldContext'`
- [x] Remove `<PrecisionShieldProvider>` wrapper (keep children — just unwrap)

### 7 — Delete PrecisionShieldContext.jsx ✅
- [x] `rm src/context/PrecisionShieldContext.jsx`

### 8 — Build verification ✅
- [x] `npm run build` — zero errors

---

## Review
_To be filled after execution._
