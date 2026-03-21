/**
 * SunsetDecoder — X-Ray / flashlight background for the Sunset Glass theme.
 *
 * A fixed <pre> filled with matrix-like schematic text that is ONLY visible
 * where the mouse is, via a single CSS mask-image radial-gradient (alpha mode).
 * Feels like shining a flashlight onto hidden code behind the glass.
 *
 * Mask strategy (simple & robust):
 *   mask-image: cursor circle + burst circles
 *   mask-mode:  alpha  (black = reveal, transparent = hide)
 *   mask-composite: add (union — bursts union with cursor)
 *   No SVG compositing, no luminance mode, no intersect — zero browser-compat risk.
 *
 * Performance:
 *   CSS mask is written once per rAF tick (not on every mousemove), keeping
 *   the main thread free and the effect at 60fps.
 *   Decoder text is generated once with a seeded RNG — fully stable across renders.
 */
import { useEffect, useRef, useMemo } from 'react';

// ── Decoder charset ────────────────────────────────────────────────────────────
const CHARS = '01010110アイウエオカキ<>{}[]()=+-*/01101100#@!;:/\\|~^%$&ABCDEFabcdef0123456789байтCODE';

function seededRand(seed) {
  let s = seed >>> 0;
  return () => {
    s = Math.imul(s ^ (s >>> 16), 0x45d9f3b) >>> 0;
    s = Math.imul(s ^ (s >>> 16), 0x45d9f3b) >>> 0;
    s ^= s >>> 16;
    return (s >>> 0) / 0xFFFFFFFF;
  };
}

export default function SunsetDecoder() {
  const layerRef = useRef(null);

  // Stable decoder text — seeded so it never changes between renders
  const decoderText = useMemo(() => {
    const rng  = seededRand(0xCAFEBABE);
    const rows = 65;
    const cols = 220;
    return Array.from({ length: rows }, () =>
      Array.from({ length: cols }, () => CHARS[Math.floor(rng() * CHARS.length)]).join('')
    ).join('\n');
  }, []);

  useEffect(() => {
    const layer = layerRef.current;
    if (!layer) return;

    let rafId;
    let mx = -9999;
    let my = -9999;

    const onMove = (e) => { mx = e.clientX; my = e.clientY; };

    // ── Data Bursts — autonomous ambient reveals ───────────────────────────────
    const bursts = [];
    let burstInterval = null;

    const spawnBurst = () => {
      if (bursts.length >= 3) return;
      const W   = window.innerWidth;
      const H   = window.innerHeight;
      const minX = Math.max(W * 0.55, 720);
      const x   = minX + Math.random() * (W - minX - 80);
      const y   = 60   + Math.random() * (H - 120);
      const dur = 2200 + Math.random() * 800;
      bursts.push({ x, y, maxR: 70 + Math.random() * 60, startTime: Date.now(), endTime: Date.now() + dur });
    };

    const burstTimer = setTimeout(() => {
      spawnBurst();
      burstInterval = setInterval(spawnBurst, 2800 + Math.random() * 600);
    }, 2000);

    const tick = () => {
      const now = Date.now();

      // Remove expired bursts
      for (let i = bursts.length - 1; i >= 0; i--) {
        if (now >= bursts[i].endTime) bursts.splice(i, 1);
      }

      // Build mask layers: cursor circle + one circle per active burst
      const layers = [
        `radial-gradient(circle 160px at ${mx}px ${my}px, black 0%, transparent 100%)`,
      ];
      for (const b of bursts) {
        const t = (now - b.startTime) / (b.endTime - b.startTime);
        const r = b.maxR * Math.sin(t * Math.PI); // sine envelope: grows → peaks → shrinks
        layers.push(`radial-gradient(circle ${r | 0}px at ${b.x}px ${b.y}px, black 0%, transparent 100%)`);
      }

      const n         = layers.length;
      const maskValue = layers.join(', ');
      const modeStr   = Array(n).fill('alpha').join(', ');
      const compStd   = Array(n).fill('add').join(', ');
      const compWk    = Array(n).fill('source-over').join(', ');

      layer.style.maskImage           = maskValue;
      layer.style.webkitMaskImage     = maskValue;
      layer.style.maskMode            = modeStr;
      layer.style.webkitMaskMode      = modeStr;
      layer.style.maskComposite       = compStd;
      layer.style.webkitMaskComposite = compWk;

      rafId = requestAnimationFrame(tick);
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    rafId = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(rafId);
      clearTimeout(burstTimer);
      if (burstInterval) clearInterval(burstInterval);
    };
  }, []);

  return (
    <pre
      ref={layerRef}
      aria-hidden="true"
      className="sunset-decoder-layer"
      style={{
        position:      'fixed',
        inset:         0,
        pointerEvents: 'none',
        margin:        0,
        padding:       '10px 14px',
        fontFamily:    "'Cascadia Code', 'Fira Code', Consolas, monospace",
        fontSize:      '12px',
        lineHeight:    '1.48',
        letterSpacing: '0.04em',
        color:         'rgba(255, 107, 53, 0.92)',
        overflow:      'hidden',
        whiteSpace:    'pre',
        userSelect:    'none',
        zIndex:        1,
        // Initial mask: cursor offscreen → decoder fully hidden until first rAF tick
        maskImage:           'radial-gradient(circle 160px at -9999px -9999px, black 0%, transparent 100%)',
        WebkitMaskImage:     'radial-gradient(circle 160px at -9999px -9999px, black 0%, transparent 100%)',
        maskMode:            'alpha',
        WebkitMaskMode:      'alpha',
        maskComposite:       'add',
        WebkitMaskComposite: 'source-over',
      }}
    >
      {decoderText}
    </pre>
  );
}
