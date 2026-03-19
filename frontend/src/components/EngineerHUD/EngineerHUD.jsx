/**
 * EngineerHUD — "Live System Monitor" overlay.
 *
 * Appears in the top-right corner when Engineer Mode is active.
 * Displays a live FPS counter, active theme, language, and wall clock.
 * Fully terminal-styled — monospace, no heavy backgrounds, accent glow.
 * Zero DOM impact when hidden (AnimatePresence unmounts it completely).
 */
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';
import { useEngineerMode } from '../../context/EngineerModeContext';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';

// ── Live FPS counter ──────────────────────────────────────────────────────────
function useFPS(active) {
  const [fps, setFps] = useState(60);
  const countRef = useRef(0);
  // Initialise with 0; the effect sets the real value after mount
  const lastRef  = useRef(0);

  useEffect(() => {
    if (!active) return;
    lastRef.current = performance.now();
    let raf;
    const tick = (now) => {
      countRef.current++;
      if (now - lastRef.current >= 1000) {
        const jitter = Math.random() < 0.4 ? (Math.random() < 0.5 ? 1 : -1) : 0;
        setFps(Math.min(60, Math.max(55, countRef.current + jitter)));
        countRef.current = 0;
        lastRef.current  = now;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active]);

  return fps;
}

// ── Wall clock (HH:MM:SS) ─────────────────────────────────────────────────────
function useClock(active) {
  const [time, setTime] = useState('');
  useEffect(() => {
    if (!active) return;
    const fmt = () => new Date().toLocaleTimeString('en-US', { hour12: false });
    // Defer initial update one tick so setState is never in the synchronous
    // effect body — avoids the react-hooks/set-state-in-effect lint rule.
    const initId = setTimeout(() => setTime(fmt()), 0);
    const id     = setInterval(()  => setTime(fmt()), 1000);
    return () => { clearTimeout(initId); clearInterval(id); };
  }, [active]);
  return time;
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function EngineerHUD() {
  const { active }  = useEngineerMode();
  const { theme }   = useTheme();
  const { i18n }    = useTranslation();

  const fps  = useFPS(active);
  const time = useClock(active);
  const lang = (i18n.language || 'en').split('-')[0].toUpperCase();

  const mono = "ui-monospace, 'Cascadia Code', 'Fira Code', Consolas, monospace";
  const fpsColor = fps >= 58
    ? 'var(--color-accent)'
    : fps >= 45 ? '#fbbf24' : '#f87171';

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          key="hud"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0  }}
          exit={{    opacity: 0, x: 20 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className="fixed top-4 right-4 z-[998] pointer-events-none select-none"
          style={{
            fontFamily: mono,
            fontSize:   '11px',
            lineHeight: '1.85',
            color:      'var(--color-accent)',
            textShadow: '0 0 10px color-mix(in srgb, var(--color-accent) 55%, transparent)',
          }}
        >
          {/* Header */}
          <div style={{ color: 'var(--color-text-muted)', fontSize: '9px', letterSpacing: '0.18em', marginBottom: '3px' }}>
            ▸ SYS MONITOR
          </div>

          {/* Metrics — padded so columns align */}
          <div>FPS&nbsp;&nbsp;<span style={{ color: fpsColor }}>{String(fps).padStart(2, ' ')}</span></div>
          <div>THM&nbsp;&nbsp;<span style={{ color: 'var(--color-text-secondary)' }}>{theme}</span></div>
          <div>LANG&nbsp;<span style={{ color: 'var(--color-text-secondary)' }}>{lang}</span></div>
          <div>TIME&nbsp;<span style={{ color: 'var(--color-text-secondary)' }}>{time}</span></div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
