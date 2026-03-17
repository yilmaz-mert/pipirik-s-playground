import { createContext, useContext, useState, useCallback, useLayoutEffect } from 'react';

const EngineerModeContext = createContext(null);

/**
 * EngineerModeProvider
 *
 * Tracks engineer mode on/off state and mirrors it as a `data-engineer-mode`
 * attribute on <body>. All visual side-effects (labels, outlines) are handled
 * entirely in CSS via [data-engineer-mode] [data-comp] selectors — no extra
 * DOM nodes are ever injected.
 *
 * Keyboard shortcut: Alt + E (a common dev-tools convention)
 */
export function EngineerModeProvider({ children }) {
  const [active, setActive] = useState(
    () => localStorage.getItem('pp-engineer') === 'true'
  );

  // Sync data-engineer-mode attribute with state before paint
  useLayoutEffect(() => {
    if (active) document.body.setAttribute('data-engineer-mode', '');
    else        document.body.removeAttribute('data-engineer-mode');
  }, [active]);

  // Alt+E keyboard shortcut
  useLayoutEffect(() => {
    const handler = (e) => {
      if (e.altKey && e.key === 'e') toggle();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const toggle = useCallback(() => {
    setActive(prev => {
      const next = !prev;
      localStorage.setItem('pp-engineer', String(next));
      return next;
    });
  }, []);

  return (
    <EngineerModeContext.Provider value={{ active, toggle }}>
      {children}
    </EngineerModeContext.Provider>
  );
}

/** Consume engineer mode state and toggle anywhere in the tree. */
export function useEngineerMode() {
  const ctx = useContext(EngineerModeContext);
  if (!ctx) throw new Error('useEngineerMode must be inside <EngineerModeProvider>');
  return ctx;
}
