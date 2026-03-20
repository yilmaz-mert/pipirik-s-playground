/**
 * SunsetDecoder — "X-Ray / Decoder" background for the Sunset Glass theme.
 *
 * A fixed layer filled with matrix-like schematic text that is ONLY visible
 * exactly where the user's mouse is, via CSS mask-image with a tight radial
 * gradient. It feels like the cursor is "parting" the sunset glass to reveal
 * the code-layer behind reality.
 *
 * Masking strategy (Phase 12.1 — Swiss Cheese):
 *   mask-image has two groups of layers, combined with mask-composite:
 *     Layer 0 (top):   SVG data-URI from PrecisionShieldContext
 *                       mask-mode: luminance — white=show, black=hide (content holes)
 *     Layers 1…N:      cursor + burst radial-gradients
 *                       mask-mode: alpha — black circle = reveal
 *   mask-composite[0]: intersect (source-in for WebKit)
 *                       → decoder visible only where cursor/burst reveals AND NOT in content area
 *   mask-composite[1…]: add (source-over for WebKit)
 *                       → bursts union with cursor
 *
 * Performance:
 *   --x / --y CSS variables are written once per rAF tick (never on every
 *   mousemove event), keeping the main thread free and the effect at 60fps.
 *   The text content is generated once with a seeded RNG — fully stable.
 *   The layer is only mounted when the active theme is "sunset-glass".
 */
import { useEffect, useLayoutEffect, useRef, useMemo } from 'react';
import { usePrecisionShield } from '../../context/PrecisionShieldContext';

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

// ── Mask building ──────────────────────────────────────────────────────────────
// Combines the Swiss Cheese SVG URI (luminance mode, blocks content areas) with
// cursor + burst reveal gradients (alpha mode) using mask-composite: intersect.
// Result: decoder is only visible where cursor/burst reveals AND not in content area.

function buildMask(mx, my, bursts, swissUri) {
  const cursor = `radial-gradient(circle 160px at ${mx}px ${my}px, black 0%, transparent 100%)`;

  // Gradient layers: cursor + each burst (all alpha mode, union via add)
  const gradLayers = [cursor];
  const gradComps  = [];
  const gradModes  = ['alpha'];

  for (const b of bursts) {
    gradLayers.push(
      `radial-gradient(circle ${b.r | 0}px at ${b.x}px ${b.y}px, black 0%, transparent 100%)`
    );
    gradComps.push('add');
    gradModes.push('alpha');
  }

  if (!swissUri) {
    // No SVG yet — fallback to cursor+bursts only (first few frames before context initialises)
    const allLayers = gradLayers.join(', ');
    const stdComp   = gradComps.length ? gradComps.join(', ') : 'add';
    const wkComp    = gradComps.length ? gradComps.map(() => 'source-over').join(', ') : 'source-over';
    return {
      maskImage:           allLayers,
      WebkitMaskImage:     allLayers,
      maskMode:            gradModes.join(', '),
      WebkitMaskMode:      gradModes.join(', '),
      maskComposite:       stdComp,
      WebkitMaskComposite: wkComp,
    };
  }

  // Full combined mask:
  //   [swissUri, cursor, burst1, burst2, ...]
  //   mask-composite: [intersect, add, add, ...]
  //   mask-mode:      [luminance, alpha, alpha, ...]
  const allLayers = [swissUri, ...gradLayers].join(', ');
  const allModes  = ['luminance', ...gradModes].join(', ');
  const stdComps  = ['intersect', ...gradComps].join(', ');
  const wkComps   = ['source-in',  ...gradComps.map(() => 'source-over')].join(', ');

  return {
    maskImage:           allLayers,
    WebkitMaskImage:     allLayers,
    maskMode:            allModes,
    WebkitMaskMode:      allModes,
    maskComposite:       stdComps,
    WebkitMaskComposite: wkComps,
  };
}

export default function SunsetDecoder() {
  const layerRef = useRef(null);
  const { getMaskUri } = usePrecisionShield();
  // Capture in a ref so the RAF closure always reads the latest value
  // without needing to re-run the effect when getMaskUri identity changes.
  const getMaskUriRef = useRef(getMaskUri);
  // Sync the ref before the browser paints — useLayoutEffect avoids a stale
  // value on the very first RAF tick while keeping the mutation out of render.
  useLayoutEffect(() => { getMaskUriRef.current = getMaskUri; }, [getMaskUri]);

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

    const onMove = (e) => { mx = e.clientX; my = e.clientY; };

    // ── Data Bursts — autonomous ambient reveals ───────────────────────────
    // Each burst: { x, y, maxR, startTime, endTime }
    const bursts = [];

    const spawnBurst = () => {
      if (bursts.length >= 3) return;
      const W = window.innerWidth;
      const H = window.innerHeight;
      // Spawn only in the visible zone (past the area-shield at ~44rem = 704px)
      const minX = Math.max(W * 0.55, 720);
      const x    = minX + Math.random() * (W - minX - 80);
      const y    = 60   + Math.random() * (H - 120);
      const dur  = 2200 + Math.random() * 800; // 2.2–3 s lifetime
      bursts.push({
        x, y,
        maxR:      70 + Math.random() * 60,
        startTime: Date.now(),
        endTime:   Date.now() + dur,
      });
    };

    // First burst after 2s; then every ~3s
    const burstTimer = setTimeout(() => {
      spawnBurst();
      const interval = setInterval(spawnBurst, 2800 + Math.random() * 600);
      // Store cleanup on the timeout ref for teardown
      burstTimer._interval = interval;
    }, 2000);

    const tick = () => {
      const now = Date.now();

      // Remove expired bursts
      for (let i = bursts.length - 1; i >= 0; i--) {
        if (now >= bursts[i].endTime) bursts.splice(i, 1);
      }

      // Compute current burst radii (sine curve: grows → peaks → shrinks)
      const activeBursts = bursts.map((b) => {
        const t = (now - b.startTime) / (b.endTime - b.startTime); // 0…1
        const r = b.maxR * Math.sin(t * Math.PI);                  // sine envelope
        return { x: b.x, y: b.y, r };
      });

      // Build combined mask: Swiss Cheese SVG intersect (cursor + burst reveals)
      const masks = buildMask(mx, my, activeBursts, getMaskUriRef.current());
      layer.style.maskImage           = masks.maskImage;
      layer.style.webkitMaskImage     = masks.WebkitMaskImage;
      layer.style.maskMode            = masks.maskMode || '';
      layer.style.webkitMaskMode      = masks.WebkitMaskMode || '';
      layer.style.maskComposite       = masks.maskComposite;
      layer.style.webkitMaskComposite = masks.WebkitMaskComposite;

      rafId = requestAnimationFrame(tick);
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    rafId = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(rafId);
      clearTimeout(burstTimer);
      clearInterval(burstTimer._interval);
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
        zIndex:        1,
        pointerEvents: 'none',
        margin:        0,
        padding:       '10px 14px',
        fontFamily:    "'Cascadia Code', 'Fira Code', Consolas, monospace",
        fontSize:      '12px',
        lineHeight:    '1.48',
        letterSpacing: '0.04em',
        color:         'rgba(255, 107, 53, 0.55)',
        overflow:      'hidden',
        whiteSpace:    'pre',
        userSelect:    'none',
        // Initial mask: cursor offscreen → decoder invisible until first RAF tick.
        // The RAF tick overwrites this with the full combined mask each frame.
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
