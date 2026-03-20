/**
 * PrecisionShieldContext — "Swiss Cheese" Dynamic Canvas Masking
 *
 * APPROACH (Phase 12.1):
 *   Instead of a physical div between canvas and content, this context generates
 *   a dynamic SVG data-URI mask. The SVG has a white background (show canvas)
 *   with black rectangles at registered content positions ("holes").
 *   Applied directly to canvas element styles — zero DOM overhead.
 *
 * z-index stack (unchanged):
 *   z: 0  — FluidBackground / NeonAscii canvas
 *   z: 1  — SunsetDecoder <pre>
 *   z: 10 — page content (Home.jsx relative z-10)
 *   NO z:4 shield div — it is gone.
 *
 * USAGE:
 *   Content component (its area becomes a "hole" that blocks the canvas):
 *     const { register } = usePrecisionShield();
 *     const ref = useRef(null);
 *     useEffect(() => register('my-id', ref), [register]);
 *
 *   Canvas component (receives the Swiss Cheese mask directly):
 *     const { registerCanvas } = usePrecisionShield();
 *     const canvasRef = useRef(null);
 *     useEffect(() => registerCanvas(canvasRef), [registerCanvas]);
 *
 *   SunsetDecoder (reads URI each RAF tick to combine with gradient layers):
 *     const { getMaskUri } = usePrecisionShield();
 *     // In RAF tick: const uri = getMaskUri(); → pass to buildMask(mx, my, bursts, uri)
 */
import { createContext, useContext, useRef, useEffect, useCallback } from 'react';

const PrecisionShieldCtx = createContext({
  register:       () => () => {},
  registerCanvas: () => () => {},
  getMaskUri:     () => '',
});

// Build an SVG data-URI: white background + black rectangles at hole positions.
// mask-mode: luminance → white = show canvas, black = hide canvas (content hole).
function buildSvgUri(holes) {
  const W = window.innerWidth;
  const H = window.innerHeight;
  const rects = holes
    .filter(h => h.width > 0 && h.height > 0)
    .map(h =>
      `<rect x="${h.left | 0}" y="${h.top | 0}" width="${(h.width + 1) | 0}" height="${(h.height + 1) | 0}" fill="black"/>`
    )
    .join('');
  const svg = (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">` +
    `<rect width="${W}" height="${H}" fill="white"/>` +
    rects +
    `</svg>`
  );
  return 'data:image/svg+xml,' + encodeURIComponent(svg);
}

export function PrecisionShieldProvider({ children }) {
  const holesRef   = useRef(new Map()); // id → React ref (content elements = holes)
  const canvasesRef = useRef(new Set()); // Set of React refs for canvas elements
  const roRef      = useRef(null);
  const maskUriRef = useRef('');         // current SVG URI — read by getMaskUri()

  const updateMask = useCallback(() => {
    // Collect bounding boxes of all registered content holes
    const holes = [];
    holesRef.current.forEach((elRef) => {
      const el = elRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      if (r.width > 0 && r.height > 0) holes.push(r);
    });

    const uri = buildSvgUri(holes);
    maskUriRef.current = uri;

    // Push mask directly to registered canvas element styles — no React re-render
    canvasesRef.current.forEach((canvasRef) => {
      const el = canvasRef.current;
      if (!el) return;
      el.style.maskImage      = uri;
      el.style.webkitMaskImage = uri;
      el.style.maskMode       = 'luminance';
      el.style.webkitMaskMode  = 'luminance';
    });
  }, []);

  // register(id, ref) — add a content element as a "hole" in the canvas mask.
  // Returns a cleanup function.
  const register = useCallback((id, elRef) => {
    holesRef.current.set(id, elRef);
    if (roRef.current && elRef.current) {
      roRef.current.observe(elRef.current);
    }
    updateMask();
    return () => {
      if (roRef.current && elRef.current) {
        roRef.current.unobserve(elRef.current);
      }
      holesRef.current.delete(id);
      updateMask();
    };
  }, [updateMask]);

  // registerCanvas(ref) — canvas element receives the Swiss Cheese mask.
  // Returns a cleanup function.
  const registerCanvas = useCallback((canvasRef) => {
    canvasesRef.current.add(canvasRef);
    // Apply current mask immediately if already computed
    if (maskUriRef.current && canvasRef.current) {
      const el = canvasRef.current;
      el.style.maskImage      = maskUriRef.current;
      el.style.webkitMaskImage = maskUriRef.current;
      el.style.maskMode       = 'luminance';
      el.style.webkitMaskMode  = 'luminance';
    }
    return () => {
      canvasesRef.current.delete(canvasRef);
      const el = canvasRef.current;
      if (el) {
        el.style.maskImage      = '';
        el.style.webkitMaskImage = '';
        el.style.maskMode       = '';
        el.style.webkitMaskMode  = '';
      }
    };
  }, []);

  // getMaskUri() — called by SunsetDecoder each RAF tick.
  // Reads the current URI from a ref — always synchronous, zero overhead.
  const getMaskUri = useCallback(() => maskUriRef.current, []);

  useEffect(() => {
    roRef.current = new ResizeObserver(updateMask);
    // Observe any holes registered before this effect ran
    holesRef.current.forEach((elRef) => {
      if (elRef.current) roRef.current.observe(elRef.current);
    });
    window.addEventListener('resize', updateMask, { passive: true });
    updateMask(); // initial SVG build
    return () => {
      roRef.current.disconnect();
      window.removeEventListener('resize', updateMask);
    };
  }, [updateMask]);

  return (
    <PrecisionShieldCtx.Provider value={{ register, registerCanvas, getMaskUri }}>
      {children}
    </PrecisionShieldCtx.Provider>
  );
}

export const usePrecisionShield = () => useContext(PrecisionShieldCtx);
