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

// ── Ghost Scanner constants ────────────────────────────────────────────────────
const SCAN_BEAM_PX = CELL_SIZE * 2.5;  // beam half-width in px
const SCAN_INTERVAL_MS = 4000;          // ms between scan initiations
const SCAN_DURATION_MS = 2000;          // ms to sweep the full axis

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

    // ── Ghost Scanner state ──────────────────────────────────────────────────
    // Autonomous scan beam that sweeps across the grid periodically.
    // pos: current pixel position along the sweep axis
    // speed: pixels per frame (computed when scan starts)
    const scan = { active: false, pos: 0, dir: 'v', speed: 0 };

    let scanTimer = null;
    const startScan = () => {
      if (reduced || scan.active) return;
      scan.active = true;
      scan.dir    = Math.random() < 0.55 ? 'v' : 'h'; // favour vertical
      scan.pos    = -SCAN_BEAM_PX;
      const axis  = scan.dir === 'v' ? W : H;
      // Speed: cross full axis in SCAN_DURATION_MS at ~60fps
      scan.speed  = (axis + SCAN_BEAM_PX * 2) / (SCAN_DURATION_MS / (1000 / 60));
    };

    let rafId;

    function draw() {
      ctx.clearRect(0, 0, W, H);
      ctx.font         = FONT;
      ctx.textAlign    = 'center';
      ctx.textBaseline = 'middle';

      const r2 = GLOW_RADIUS * GLOW_RADIUS;

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const cx  = col * CELL_SIZE;
          const cy  = row * CELL_SIZE;
          const idx = row * cols + col;

          const dx   = cx - mx;
          const dy   = cy - my;
          const d2   = dx * dx + dy * dy;
          const dist = Math.sqrt(d2);

          // ── Ghost Scanner beam ─────────────────────────────────────────────
          if (!reduced && scan.active) {
            const scanDist = scan.dir === 'v'
              ? Math.abs(cx - scan.pos)
              : Math.abs(cy - scan.pos);
            if (scanDist < SCAN_BEAM_PX) {
              const t     = 1 - scanDist / SCAN_BEAM_PX;           // 0…1, 1 = centre of beam
              const alpha = 0.35 + t * 0.65;
              // Cyan tint for scan beam to distinguish from cursor glow
              ctx.fillStyle = `rgba(0, 255, 234, ${alpha.toFixed(2)})`;
              ctx.fillText(Math.random() < 0.5 ? '1' : '0', cx, cy);
              linger[idx] = Math.max(linger[idx], LINGER_FRAMES + 8);
              continue; // skip normal rendering for this cell
            }
          }

          if (!reduced && d2 <= r2) {
            // Inside cursor glow radius — light up + scramble
            linger[idx]  = LINGER_FRAMES;
            const t      = 1 - dist / GLOW_RADIUS;
            const alpha  = 0.25 + t * 0.75;
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

      // Advance scan beam position (once per frame, outside cell loop)
      if (!reduced && scan.active) {
        scan.pos += scan.speed;
        const axis = scan.dir === 'v' ? W : H;
        if (scan.pos > axis + SCAN_BEAM_PX) {
          scan.active = false;
        }
      }

      rafId = requestAnimationFrame(draw);
    }

    init();
    draw();

    if (!reduced) {
      window.addEventListener('mousemove', onMove, { passive: true });
      // Start first scan after a short delay, then repeat
      scanTimer = setTimeout(() => {
        startScan();
        scanTimer = setInterval(startScan, SCAN_INTERVAL_MS);
      }, 1500);
    }
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(scanTimer);
      clearInterval(scanTimer);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('resize',    onResize);
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
        zIndex:        0,
      }}
    />
  );
}
