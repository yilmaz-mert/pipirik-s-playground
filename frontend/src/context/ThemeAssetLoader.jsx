import { Suspense, lazy } from 'react';
import { useTheme } from './ThemeContext';

/**
 * THEME ASSET REGISTRY
 *
 * Maps a theme name to a lazy-loaded React component that mounts that
 * theme's heavy assets (Three.js canvas, WebGPU renderer, particle system,
 * audio sprites, etc.).
 *
 * HOW TO ADD A NEW SKIN:
 *   1. Create   src/themes/<skin-name>/<SkinName>Assets.jsx
 *   2. Add one line below, e.g.:
 *        'liquid-glass': lazy(() => import('../themes/liquid-glass/LiquidGlassAssets')),
 *   3. That's it — the bundle is zero-cost until the theme is actually activated.
 *
 * The component rendered by each entry receives no props; it is responsible
 * for self-positioning (e.g. fixed, z-index below content) and for cleaning
 * up its WebGL context on unmount.
 */
const THEME_ASSETS = {
  'cyber-naturalism': lazy(() => import('../themes/cyber-naturalism/FluidBackground')),
  // 'liquid-glass': lazy(() => import('../themes/liquid-glass/LiquidGlassAssets')),
  // 'retro-rpg':    lazy(() => import('../themes/retro-rpg/RetroRpgAssets')),
};

/**
 * ThemeAssetLoader
 *
 * Mounted once at the App level (inside a Suspense boundary).
 * - For themes with no entry in THEME_ASSETS (e.g. "modern-dark") it
 *   renders nothing at all — zero overhead.
 * - For themes that do have heavy assets, the bundle is fetched only once
 *   (on first activation) and cached by the browser / module system.
 * - The inner Suspense uses `fallback={null}` so the rest of the UI stays
 *   fully interactive while the asset chunk downloads.
 */
export default function ThemeAssetLoader() {
  const { theme } = useTheme();
  const ThemeAssets = THEME_ASSETS[theme];

  if (!ThemeAssets) return null;

  return (
    <Suspense fallback={null}>
      <ThemeAssets />
    </Suspense>
  );
}
