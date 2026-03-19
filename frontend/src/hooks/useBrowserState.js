/**
 * useBrowserState
 *
 * Two passive effects that keep the browser tab in sync with the OS:
 *
 *  1. Visibility API — changes document.title to ">_ System Idle..." while the
 *     tab is hidden and restores it when the user returns.
 *
 *  2. Dynamic SVG favicon — reads --color-accent from the computed styles and
 *     injects an inline SVG <link rel="icon"> so the favicon always matches
 *     the active theme. Re-runs whenever `theme` changes.
 */
import { useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';

const ACTIVE_TITLE = "Mert's Playground";
const IDLE_TITLE   = '>_ System Idle...';

export function useBrowserState() {
  const { theme } = useTheme();

  // ── Tab title ──────────────────────────────────────────────────────────────
  useEffect(() => {
    document.title = ACTIVE_TITLE;

    const onVisibility = () => {
      document.title = document.hidden ? IDLE_TITLE : ACTIVE_TITLE;
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  // ── Dynamic SVG favicon ────────────────────────────────────────────────────
  useEffect(() => {
    // Read the token value after the theme attribute has been applied.
    const accent = getComputedStyle(document.documentElement)
      .getPropertyValue('--color-accent')
      .trim() || '#B57EDC';

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
      <rect width="32" height="32" rx="7" fill="${accent}" fill-opacity="0.14"/>
      <rect x="5" y="5" width="22" height="22" rx="4"
            fill="none" stroke="${accent}" stroke-width="1.5" stroke-opacity="0.6"/>
      <text x="16" y="22" text-anchor="middle"
            font-family="monospace" font-size="16" font-weight="700"
            fill="${accent}">_</text>
    </svg>`;

    const href = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;

    let link = document.querySelector('link[rel~="icon"]');
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      link.type = 'image/svg+xml';
      document.head.appendChild(link);
    }
    link.href = href;
  }, [theme]);
}
