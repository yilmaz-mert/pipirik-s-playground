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
 *   SCALE=2 → ~520 K cells on 1080p — ~3–5 ms per frame, still well within 16 ms budget.
 *   prefers-reduced-motion skips the entire simulation (returns null).
 *
 * INTEGRATION:
 *   Lazy-loaded via ThemeAssetLoader — zero bundle cost until theme is active.
 *   canvas is fixed, pointer-events:none, mixBlendMode:'screen' so lavender
 *   ripples blend onto the dark charcoal background without blocking clicks.
 */

import { useEffect, useRef } from 'react';

// ── Simulation constants ──────────────────────────────────────────────────────
const SCALE          = 2;    // px per simulation cell (lower = sharper, heavier)
const DAMPING        = 0.95; // energy retention per frame — faster decay prevents clutter
const DISTURB_RADIUS = 5;    // wider brush for softer, silk-ribbon feel
const DISTURB_FORCE  = 15;   // low force — applied along a line so accumulated effect is strong
const DRIP_INTERVAL  = 1400; // ms between ambient random drips (rare breath)
const DRIP_FORCE     = 180;   // peak height of ambient drips (scaled down to match new force range)

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
    // Coefficient 0.46 (< 0.5 stability limit) slows propagation speed by ~8 %
    // on top of the every-other-frame skip in loop(), giving a calm, natural pace.
    function step() {
      for (let y = 1; y < rows - 1; y++) {
        for (let x = 1; x < cols - 1; x++) {
          const i = y * cols + x;
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
        // Smooth falloff: scale intensity, cap at 100 to prevent white-out where trails overlap
        const h         = cur[i] < 0 ? -cur[i] : cur[i];
        const intensity = Math.min(100, h * 1.4);
        d[i * 4 + 3]   = intensity | 0;
      }

      offCtx.putImageData(imgData, 0, 0);

      ctx.clearRect(0, 0, W, H);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'medium';
      // Scale the low-res simulation up to fill the viewport — smoothly blurred
      ctx.drawImage(offscreen, 0, 0, W, H);
    }

    // ── RAF loop ────────────────────────────────────────────────────────────
    // step() runs on even frames only — halves wave propagation speed while
    // keeping the canvas refreshed at full 60 fps for smooth alpha transitions.
    function loop() {
      step();
      render();
      rafId = requestAnimationFrame(loop);
    }

    // ── Event listeners ─────────────────────────────────────────────────────
    // Track previous position so we can interpolate a continuous trail
    let prevMX = null, prevMY = null;

    const onMouseMove = (e) => {
      const mx = e.clientX, my = e.clientY;
      if (prevMX === null) {
        disturb(mx, my);
      } else {
        // Interpolate points along the mouse path so fast movements leave no gaps
        const dx   = mx - prevMX;
        const dy   = my - prevMY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        // Step every ~SCALE pixels so adjacent disturbance circles just touch
        const steps = Math.max(1, Math.ceil(dist / SCALE));
        for (let s = 0; s <= steps; s++) {
          const t = s / steps;
          disturb(prevMX + dx * t, prevMY + dy * t);
        }
      }
      prevMX = mx;
      prevMY = my;
    };

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
        mixBlendMode:  'screen',
        zIndex:        0,
      }}
    />
  );
}
