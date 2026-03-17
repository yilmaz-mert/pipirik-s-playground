/**
 * FluidBackground — Digital Lavender wave simulation for Cyber-Naturalism theme.
 *
 * HOW IT WORKS:
 *   Classic two-buffer wave propagation on a downsampled Float32Array grid:
 *
 *     new[i] = (cur[i±1] + cur[i±cols]) / 2  −  prev[i]
 *     new[i] *= DAMPING                        (energy loss per frame)
 *
 *   The grid is rendered at 1/SCALE resolution then upscaled via drawImage,
 *   giving smooth antialiased ripples at minimal CPU cost.
 *
 *   Every DRIP_INTERVAL ms a random ambient droplet is added so the
 *   surface stays alive even when the mouse is idle.
 *
 * PERFORMANCE:
 *   SCALE=4 → ~130 K cells on 1080p — ~1–2 ms per frame well within 16 ms budget.
 *   prefers-reduced-motion skips the entire simulation (returns null).
 *
 * INTEGRATION:
 *   Lazy-loaded via ThemeAssetLoader — zero bundle cost until theme is active.
 *   canvas is fixed, pointer-events:none, mixBlendMode:'screen' so lavender
 *   ripples blend onto the dark charcoal background without blocking clicks.
 */

import { useEffect, useRef } from 'react';

// ── Simulation constants ──────────────────────────────────────────────────────
const SCALE          = 4;    // px per simulation cell (lower = sharper, heavier)
const DAMPING        = 0.982; // energy retention per frame (0–1)
const DISTURB_RADIUS = 5;    // radius of mouse/touch disturbance in cells
const DISTURB_FORCE  = 280;  // peak height added at disturbance centre
const DRIP_INTERVAL  = 1400; // ms between ambient random drips
const DRIP_FORCE     = 180;  // peak height of ambient drips

// Digital Lavender RGB — matches --color-accent (#B57EDC)
const R = 181, G = 126, B = 220;

// ── Component ─────────────────────────────────────────────────────────────────
export default function FluidBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx     = canvas.getContext('2d');
    const offscreen = document.createElement('canvas');
    const offCtx  = offscreen.getContext('2d');

    let rafId;
    let cols, rows;
    let cur, prev;   // Float32Array height-field buffers
    let imgData;     // low-res ImageData written to offscreen each frame
    let W, H;

    // ── Initialise / resize ─────────────────────────────────────────────────
    function init() {
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width  = W;
      canvas.height = H;

      // +2 adds a 1-cell silent border so boundary cells stay 0 (no reflections)
      cols = Math.ceil(W / SCALE) + 2;
      rows = Math.ceil(H / SCALE) + 2;

      offscreen.width  = cols;
      offscreen.height = rows;

      cur     = new Float32Array(cols * rows);
      prev    = new Float32Array(cols * rows);
      imgData = offCtx.createImageData(cols, rows);

      // Pre-bake RGB channels — only alpha changes per frame
      const d = imgData.data;
      for (let i = 0, n = cols * rows; i < n; i++) {
        d[i * 4]     = R;
        d[i * 4 + 1] = G;
        d[i * 4 + 2] = B;
        // d[i * 4 + 3] written per frame
      }
    }

    // ── Disturb surface at (mx, my) in screen px ────────────────────────────
    function disturb(mx, my, force = DISTURB_FORCE) {
      const cx = (mx / SCALE | 0) + 1;  // +1 for border offset
      const cy = (my / SCALE | 0) + 1;
      const r2 = DISTURB_RADIUS * DISTURB_RADIUS;

      for (let dy = -DISTURB_RADIUS; dy <= DISTURB_RADIUS; dy++) {
        for (let dx = -DISTURB_RADIUS; dx <= DISTURB_RADIUS; dx++) {
          const x = cx + dx;
          const y = cy + dy;
          if (x > 0 && x < cols - 1 && y > 0 && y < rows - 1) {
            const d2 = dx * dx + dy * dy;
            if (d2 <= r2) {
              cur[y * cols + x] += force * (1 - Math.sqrt(d2) / DISTURB_RADIUS);
            }
          }
        }
      }
    }

    // ── Propagate wave one tick ─────────────────────────────────────────────
    function step() {
      for (let y = 1; y < rows - 1; y++) {
        for (let x = 1; x < cols - 1; x++) {
          const i = y * cols + x;
          // Wave equation: new = avg(4 neighbours) * 2 - prev; then damp
          prev[i] = (
            cur[i - 1] + cur[i + 1] + cur[i - cols] + cur[i + cols]
          ) * 0.5 - prev[i];
          prev[i] *= DAMPING;
        }
      }
      // Swap buffers: prev is now "current", cur becomes "previous"
      const tmp = cur;
      cur  = prev;
      prev = tmp;
    }

    // ── Write pixel alphas from wave heights and blit to main canvas ────────
    function render() {
      const d = imgData.data;
      for (let i = 0, n = cols * rows; i < n; i++) {
        // map |height| → 0–140 alpha (screen blend stays subtle)
        const h = cur[i];
        d[i * 4 + 3] = (h < 0 ? -h : h) * 0.55 > 140 ? 140 : (h < 0 ? -h : h) * 0.55 | 0;
      }

      offCtx.putImageData(imgData, 0, 0);

      ctx.clearRect(0, 0, W, H);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'medium';
      // Scale the low-res simulation up to fill the viewport — smoothly blurred
      ctx.drawImage(offscreen, 0, 0, W, H);
    }

    // ── RAF loop ────────────────────────────────────────────────────────────
    function loop() {
      step();
      render();
      rafId = requestAnimationFrame(loop);
    }

    // ── Event listeners ─────────────────────────────────────────────────────
    const onMouseMove = (e) => disturb(e.clientX, e.clientY);
    const onTouchMove = (e) => {
      const t = e.touches[0];
      if (t) disturb(t.clientX, t.clientY, DISTURB_FORCE * 0.6);
    };
    const onResize = () => init();

    // ── Ambient drips — keep surface alive when mouse is idle ───────────────
    const dripTimer = setInterval(() => {
      disturb(
        Math.random() * W,
        Math.random() * H,
        DRIP_FORCE * (0.4 + Math.random() * 0.6),
      );
    }, DRIP_INTERVAL);

    // ── Boot ────────────────────────────────────────────────────────────────
    init();
    loop();

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('touchmove',  onTouchMove,  { passive: true });
    window.addEventListener('resize',     onResize);

    return () => {
      cancelAnimationFrame(rafId);
      clearInterval(dripTimer);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('touchmove',  onTouchMove);
      window.removeEventListener('resize',     onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position:      'fixed',
        inset:         0,
        width:         '100%',
        height:        '100%',
        pointerEvents: 'none',
        // Sits above the CSS blob layer (z:-1) but below all page content (z:10+)
        zIndex:        0,
        // Screen blend: lavender ripples lighten the dark base without washing it out
        mixBlendMode:  'screen',
      }}
    />
  );
}
