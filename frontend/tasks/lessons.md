# Lessons Learned

_Updated after each phase's corrections._

---

## Phase 17

### L11 — Nested CSS Masks Compose Independently
Applying `mask-image` to a wrapper div and a different `mask-image` to a child element via inline `style` are fully independent operations. The wrapper's mask clips the stacking context's visual output. The child's mask clips the child element before compositing into the wrapper. Final pixel: visible only where BOTH masks allow. This makes "fade + precision-hole" stacking trivially correct.

### L12 — `mask-image` on a Parent Contains `position:fixed` Children
When a parent element has `mask-image` (or `transform`, `filter`, `will-change`, etc.), it creates a new stacking context and acts as a containing block for `position:fixed` descendants. Since the parent is `fixed inset-0`, children with `fixed inset-0` still fill the full viewport. No visual regression — just cleaner masking hierarchy.

### L13 — Patch the Canvas, Not the UI
When a background canvas effect bleeds into UI content, the correct fix is to constrain the canvas (mask-image, opacity, z-index) — not to patch the UI layer with solid backgrounds or gradients that obscure glassmorphic depth. The "smudge" patches in Phase 16 were a symptom of fixing the wrong layer.

---

## Phase 16

### L7 — Morphing Border-Radius Creates Transparent Corner Gaps
An element with `overflow-hidden` and an animated `border-radius` clips its children into a blob shape, but the gap between that blob and the element's rectangular bounding box is transparent — the parent container shows through. If the parent also has no background, the z=0 canvas bleeds through. Fix: give the outer wrapper the page's base background color. One line, zero layout change.

### L8 — `color-mix(in srgb, var(--token) N%, transparent)` for Adaptive Fog
Using `color-mix` directly in a CSS gradient (inline style) is the cleanest way to create theme-aware semi-transparent backgrounds. `var(--color-bg-base)` is a hex value — `color-mix` converts it to rgba on the fly. Supported by all modern browsers and requires no JS logic.

### L9 — CSS-Only Themes Need No ThemeAssetLoader Entry
Themes with no canvas/WebGL assets (like cyber-paper) don't need an entry in `ThemeAssetLoader`. The blob animation CSS becomes near-invisible with `rgba(…, 0.02-0.03)` blob tokens. SunsetDecoder and NeonAscii are already gated by theme checks in App.jsx — they exclude themselves automatically.

### L10 — AudioNode Graphs Should Have Explicit Teardown
When synthesizing audio with Web Audio API, BufferSource nodes auto-stop when done (one-shot). GainNode and BiquadFilter are garbage-collected once disconnected. For `playClick`-style one-shot sounds, no manual teardown needed — nodes are created and garbage-collected per invocation.

---

## Phase 15

### L5 — mask-composite: intersect Is Fragile
CSS `mask-composite: intersect` across mixed mask-modes (luminance + alpha) has poor cross-browser reliability. If either layer resolves to all-transparent (SVG not yet ready, context returns empty string, etc.), the AND zeroes everything → component is 100% invisible. **Rule:** For cursor/reveal masks, use only `alpha` mode with `add` (union). Reserve `intersect` only when both layers are guaranteed non-empty and well-tested.

### L6 — CSS Grid vs Flex for Aligned Label/Data Layouts
Flex-based label rows that must align pixel-perfectly with flex data rows fail when: (1) `overflow: hidden` clips short text in narrow cells, (2) `aspect-ratio` adds fractional heights that round differently across rows. Use CSS Grid with identical `grid-template-columns` on both the label row and data row — alignment is guaranteed by the grid engine itself, not by matching JS values.

---

## Phase 14

### L1 — Spring Config ≠ Zero Lag
Framer Motion's `useSpring` on cursor position creates intentional trailing. When "zero lag" is the goal, use raw `useMotionValue` directly — skip the spring entirely for position. Reserve spring for morphing properties (size, opacity, border) where smooth transitions are desirable.

### L2 — Holographic Effects Require Care
Visual effects like RGB channel splitting via duplicated `<img>` elements + `mixBlendMode: screen` add DOM weight and complexity. Before adding them, confirm the design intent. They are hard to "partially revert" — keep holographic layers isolated so they can be cleanly stripped.

### L3 — Month Label Alignment Requires Same Date Formula
When a grid uses `today - N*7 - dayOfWeek` for date computation, any companion label computation (like month headers) MUST use the identical formula. Diverging formulas produce up to 6-day misalignments that look like broken layout.

### L4 — Magnetic Pull: Wrapper Pattern
For magnetic effects on HeroUI/third-party components that cannot be converted to `motion.*`, use a `motion.div` wrapper with `useMotionValue` + `useSpring` on x/y. Apply pointer events on the wrapper, not the inner component. Always guard with `pointer: fine` to avoid firing on touch.
