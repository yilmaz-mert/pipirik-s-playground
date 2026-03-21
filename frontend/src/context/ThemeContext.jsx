import { createContext, useContext, useState, useCallback, useLayoutEffect } from 'react';
import { flushSync } from 'react-dom';

/**
 * THEME REGISTRY
 * Add new skin names here as the project grows.
 * Each name must have a matching [data-theme="<name>"] block in index.css.
 */
const THEMES = ['cyber-naturalism', 'neon-monochrome', 'sunset-glass', 'cyber-paper'];

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(
    // Migrate old stored value if user had the previous key
    () => {
      const stored = localStorage.getItem('pp-theme');
      return THEMES.includes(stored) ? stored : 'cyber-naturalism';
    }
  );

  // Apply data-theme before first paint to prevent a flash of default styles.
  // useLayoutEffect is synchronous — it fires before the browser paints.
  useLayoutEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  /**
   * setTheme — switches the active skin.
   * Uses the View Transition API when available for a seamless cross-fade.
   * Falls back to an instant swap in older browsers.
   * flushSync forces React to flush synchronously inside the transition
   * callback so the browser captures the correct "before" and "after" frames.
   */
  const setTheme = useCallback((newTheme) => {
    if (!document.startViewTransition) {
      setThemeState(newTheme);
      localStorage.setItem('pp-theme', newTheme);
      return;
    }

    document.startViewTransition(() => {
      flushSync(() => {
        setThemeState(newTheme);
        localStorage.setItem('pp-theme', newTheme);
      });
    });
  }, []);

  /** Convenience helper — cycles through THEMES in order. */
  const cycleTheme = useCallback(() => {
    const next = THEMES[(THEMES.indexOf(theme) + 1) % THEMES.length];
    setTheme(next);
  }, [theme, setTheme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, cycleTheme, themes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
}

/** Hook for consuming theme state and controls anywhere in the tree. */
export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>');
  return ctx;
}
