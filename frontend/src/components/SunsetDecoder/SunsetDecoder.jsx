/**
 * SunsetDecoder — "X-Ray / Decoder" background for the Sunset Glass theme.
 *
 * A fixed layer filled with matrix-like schematic text that is ONLY visible
 * exactly where the user's mouse is, via CSS mask-image with a tight radial
 * gradient. It feels like the cursor is "parting" the sunset glass to reveal
 * the code-layer behind reality.
 *
 * Performance:
 *   - --x / --y CSS variables are written once per rAF tick (never on every
 *     mousemove event), keeping the main thread free and the effect at 60fps.
 *   - The text content is generated once with a seeded RNG — fully stable.
 *   - The layer is only mounted when the active theme is "sunset-glass".
 */
import { useEffect, useRef, useMemo } from 'react';

// ── Decoder charset — binary, hex, and katakana for the "code behind reality" feel
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

  // Generate stable decoder text once — seeded so it never changes between renders
  const decoderText = useMemo(() => {
    const rng  = seededRand(0xCAFEBABE);
    const rows = 65;
    const cols = 220;
    return Array.from({ length: rows }, () =>
      Array.from({ length: cols }, () => {
        const idx = Math.floor(rng() * CHARS.length);
        return CHARS[idx];
      }).join('')
    ).join('\n');
  }, []);

  useEffect(() => {
    const layer = layerRef.current;
    if (!layer) return;

    let rafId;
    let mx = -9999;
    let my = -9999;

    const onMove = (e) => {
      mx = e.clientX;
      my = e.clientY;
    };

    const tick = () => {
      layer.style.setProperty('--x', mx + 'px');
      layer.style.setProperty('--y', my + 'px');
      rafId = requestAnimationFrame(tick);
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    rafId = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <pre
      ref={layerRef}
      aria-hidden="true"
      style={{
        position:             'fixed',
        inset:                0,
        zIndex:               1,
        pointerEvents:        'none',
        margin:               0,
        padding:              '10px 14px',
        fontFamily:           "'Cascadia Code', 'Fira Code', Consolas, monospace",
        fontSize:             '12px',
        lineHeight:           '1.48',
        letterSpacing:        '0.04em',
        color:                'rgba(255, 107, 53, 0.55)',
        overflow:             'hidden',
        whiteSpace:           'pre',
        userSelect:           'none',
        // Dual mask via mask-composite: intersect —
        //   Layer 1 (left-fade): permanently hides the left ~40% so decoder text
        //             never occludes the Hero text column, regardless of cursor.
        //   Layer 2 (cursor-reveal): radial window that follows the mouse.
        //   intersect = only pixels opaque in BOTH layers are visible, so the
        //               left zone is always dark, right zone reveals at cursor.
        maskImage:            'linear-gradient(to right, transparent 0%, transparent 8%, black 42%, black 100%), radial-gradient(circle 160px at var(--x, -9999px) var(--y, -9999px), black 0%, transparent 100%)',
        WebkitMaskImage:      'linear-gradient(to right, transparent 0%, transparent 8%, black 42%, black 100%), radial-gradient(circle 160px at var(--x, -9999px) var(--y, -9999px), black 0%, transparent 100%)',
        maskComposite:        'intersect',
        WebkitMaskComposite:  'source-in',
      }}
    >
      {decoderText}
    </pre>
  );
}
