/**
 * NeonAscii — ASCII Lidar background for the Neon-Monochrome theme.
 *
 * HOW IT WORKS:
 *   A canvas is filled with a uniform grid of '+' characters drawn via
 *   fillText(). On each rAF tick:
 *     1. All cells render as faint '+' at ~6% opacity.
 *     2. Cells within GLOW_RADIUS px of the mouse light up to full accent
 *        colour and scramble to '1' or '0' — the closer to centre the brighter.
 *     3. After the mouse leaves a cell's radius its scrambled char persists for
 *        LINGER_FRAMES before fading back to '+', giving an afterglow trail.
 *
 * PERFORMANCE:
 *   Direct canvas 2D API — no DOM per-cell. Runs well into the thousands of
 *   cells at 60fps on any modern device.
 *   prefers-reduced-motion: renders static grid, skips mouse animation.
 */

import { useEffect, useRef } from 'react';

// ── Constants ─────────────────────────────────────────────────────────────────
const CELL_SIZE    = 22;       // px between cell centres (grid pitch)
const FONT_SIZE    = 11;       // px — must be ≤ CELL_SIZE for no overlap
const GLOW_RADIUS  = 150;      // px — cursor influence sphere
const LINGER_FRAMES = 18;      // frames a lit cell stays scrambled after leaving radius
const ACCENT       = '#00d980'; // matches --color-accent for neon-monochrome theme
const DIM_ALPHA    = 0.06;     // base alpha for unlit cells
const FONT         = `${FONT_SIZE}px "Cascadia Code", "Fira Code", Consolas, monospace`;

export default function NeonAscii() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const canvas  = canvasRef.current;
    if (!canvas) return;
    const ctx     = canvas.getContext('2d');

    let W, H, cols, rows;
    // Per-cell state: 0 = idle, >0 = linger countdown
    let linger; // Uint8Array

    function init() {
      W    = window.innerWidth;
      H    = window.innerHeight;
      canvas.width  = W;
      canvas.height = H;
      cols   = Math.ceil(W / CELL_SIZE) + 1;
      rows   = Math.ceil(H / CELL_SIZE) + 1;
      linger = new Uint8Array(cols * rows);
    }

    let mx = -9999, my = -9999;
    const onMove = (e) => { mx = e.clientX; my = e.clientY; };
    const onResize = () => init();

    let rafId;

    function draw() {
      ctx.clearRect(0, 0, W, H);
      ctx.font         = FONT;
      ctx.textAlign    = 'center';
      ctx.textBaseline = 'middle';

      const r2 = GLOW_RADIUS * GLOW_RADIUS;

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const cx = col * CELL_SIZE;
          const cy = row * CELL_SIZE;
          const idx = row * cols + col;

          const dx = cx - mx;
          const dy = cy - my;
          const d2 = dx * dx + dy * dy;
          const dist = Math.sqrt(d2);

          if (!reduced && d2 <= r2) {
            // Inside glow radius — light up + scramble
            linger[idx]  = LINGER_FRAMES;
            const t      = 1 - dist / GLOW_RADIUS;           // 0…1, 1 = centre
            const alpha  = 0.25 + t * 0.75;                  // 0.25…1.0
            ctx.fillStyle = `rgba(0, 217, 128, ${alpha.toFixed(2)})`;
            ctx.fillText(Math.random() < 0.5 ? '1' : '0', cx, cy);
          } else if (!reduced && linger[idx] > 0) {
            // Linger: fading afterglow
            linger[idx]--;
            const alpha = (linger[idx] / LINGER_FRAMES) * 0.55;
            ctx.fillStyle = `rgba(0, 217, 128, ${alpha.toFixed(2)})`;
            ctx.fillText(Math.random() < 0.5 ? '1' : '0', cx, cy);
          } else {
            // Idle cell
            ctx.fillStyle = `rgba(0, 217, 128, ${DIM_ALPHA})`;
            ctx.fillText('+', cx, cy);
          }
        }
      }

      rafId = requestAnimationFrame(draw);
    }

    init();
    draw();

    if (!reduced) {
      window.addEventListener('mousemove', onMove, { passive: true });
    }
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('resize',    onResize);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
        zIndex:        0,
        // Fade left ~40% so the canvas never obscures Hero text
        maskImage:            'linear-gradient(to right, transparent 0%, transparent 8%, black 42%, black 100%)',
        WebkitMaskImage:      'linear-gradient(to right, transparent 0%, transparent 8%, black 42%, black 100%)',
      }}
    />
  );
}
