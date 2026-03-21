/**
 * CommandPalette — Global CMD+K / CTRL+K launcher.
 *
 * DESIGN: "Raycast / macOS Spotlight" aesthetic —
 *   - Enormous backdrop blur (64px), near-black transparent glass panel
 *   - Large xl input with no visible chrome, just a clean caret
 *   - No border (or barely-there hairline), zero visual weight
 *   - Item rows: generous height, icon + label, subtle accent-bar on active
 *   - Group headers: ultra-small, letter-spaced, barely visible
 *   - Minimal footer with keyboard hints only
 *
 * Commands: Navigation · System (theme, engineer, mute) · Language · Danger Zone
 */
import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Home, User, LayoutGrid,
  Palette, Code2, Globe,
  Volume2, VolumeX, Terminal,
  ArrowRight,
} from 'lucide-react';
import { useTheme }        from '../../context/ThemeContext';
import { useEngineerMode } from '../../context/EngineerModeContext';
import { useSound }        from '../../context/SoundContext';
import { useTranslation }  from 'react-i18next';
import { langs }           from '../../constants/langs';

const MONO = "ui-monospace, 'Cascadia Code', 'Fira Code', Consolas, monospace";

export default function CommandPalette({ onMatrixRain }) {
  const [open,   setOpen]   = useState(false);
  const [query,  setQuery]  = useState('');
  const [cursor, setCursor] = useState(0);
  const inputRef  = useRef(null);
  const listRef   = useRef(null);

  const navigate = useNavigate();
  const { cycleTheme, theme }                           = useTheme();
  const { active: engineerOn, toggle: toggleEngineer }  = useEngineerMode();
  const { muted, toggleMute, playTick, playClick }       = useSound();
  const { i18n }                                        = useTranslation();

  const close = useCallback(() => {
    setOpen(false);
    setQuery('');
    setCursor(0);
  }, []);

  // CMD+K / CTRL+K global shortcut + custom event
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        playClick();
        setOpen(v => !v);
      }
      if (e.key === 'Escape' && open) close();
    };
    const onEvt = () => setOpen(v => !v);
    window.addEventListener('keydown', onKey);
    window.addEventListener('cmd-palette-toggle', onEvt);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('cmd-palette-toggle', onEvt);
    };
  }, [open, close, playClick]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 40);
  }, [open]);

  const commands = useMemo(() => [
    { id: 'home',     icon: Home,       label: 'Go to Home',           group: 'Navigation', action: () => { navigate('/');         close(); } },
    { id: 'about',    icon: User,       label: 'Go to About',          group: 'Navigation', action: () => { navigate('/about');    close(); } },
    { id: 'projects', icon: LayoutGrid, label: 'Go to Projects',       group: 'Navigation', action: () => { navigate('/projects'); close(); } },
    { id: 'theme',    icon: Palette,    label: `Cycle Theme  ›  ${theme}`, group: 'System', action: () => { cycleTheme(); close(); } },
    { id: 'engineer', icon: Code2,      label: engineerOn ? 'Disable Engineer Mode' : 'Enable Engineer Mode', group: 'System', action: () => { toggleEngineer(); close(); } },
    { id: 'mute',     icon: muted ? Volume2 : VolumeX, label: muted ? 'Unmute Sounds' : 'Mute Sounds', group: 'System', action: () => { toggleMute(); close(); } },
    ...langs.map(l => ({
      id:     `lang-${l.code}`,
      icon:   Globe,
      label:  `Switch Language  ›  ${l.label}`,
      group:  'Language',
      action: () => { i18n.changeLanguage(l.code); close(); },
    })),
    { id: 'matrix', icon: Terminal, label: 'Execute Matrix Protocol', group: '⚠ Danger Zone', action: () => { onMatrixRain?.(); close(); } },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ], [theme, engineerOn, muted, i18n.language, navigate, cycleTheme, toggleEngineer, toggleMute, close, onMatrixRain]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? commands.filter(c => c.label.toLowerCase().includes(q)) : commands;
  }, [commands, query]);

  const groups = useMemo(() =>
    filtered.reduce((acc, cmd) => {
      (acc[cmd.group] ??= []).push(cmd);
      return acc;
    }, {}),
  [filtered]);

  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      playClick();
      setCursor(v => Math.min(v + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      playClick();
      setCursor(v => Math.max(v - 1, 0));
    } else if (e.key === 'Enter') {
      filtered[cursor]?.action();
    }
  };

  useEffect(() => setCursor(0), [query]);
  useEffect(() => {
    listRef.current?.querySelector('[data-active="true"]')?.scrollIntoView({ block: 'nearest' });
  }, [cursor]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* ── Backdrop — deep tinted blur ── */}
          <motion.div
            key="cp-bg"
            className="fixed inset-0 z-[2000]"
            style={{ backgroundColor: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{    opacity: 0 }}
            transition={{ duration: 0.12 }}
            onClick={close}
          />

          {/* ── Panel — Raycast glass ── */}
          <motion.div
            key="cp-panel"
            className="fixed z-[2001] left-1/2 top-[13vh] w-[calc(100%-2rem)] max-w-[600px]
                       -translate-x-1/2 rounded-2xl overflow-hidden"
            style={{
              backgroundColor:      'rgba(8, 8, 10, 0.82)',
              border:               '1px solid rgba(255,255,255,0.06)',
              backdropFilter:       'blur(64px) saturate(180%)',
              WebkitBackdropFilter: 'blur(64px) saturate(180%)',
              boxShadow: '0 32px 96px rgba(0,0,0,0.80), 0 1px 0 rgba(255,255,255,0.05) inset',
            }}
            initial={{ opacity: 0, y: -24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0,   scale: 1    }}
            exit={{    opacity: 0, y: -16, scale: 0.97 }}
            transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
            onClick={e => e.stopPropagation()}
          >
            {/* ── Search input — large & unadorned ── */}
            <div className="flex items-center px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <input
                ref={inputRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Search commands…"
                className="flex-1 bg-transparent outline-none"
                style={{
                  fontSize:    '1.2rem',
                  fontWeight:  500,
                  fontFamily:  MONO,
                  color:       'var(--color-text-primary)',
                  caretColor:  'var(--color-accent)',
                  letterSpacing: '0.01em',
                }}
                autoComplete="off"
                spellCheck={false}
              />
              <kbd
                className="text-[10px] px-2 py-0.5 rounded font-mono opacity-30 flex-shrink-0 ml-3"
                style={{
                  border: '1px solid rgba(255,255,255,0.12)',
                  color:  'var(--color-text-muted)',
                }}
              >ESC</kbd>
            </div>

            {/* ── Command list ── */}
            <div ref={listRef} className="overflow-y-auto" style={{ maxHeight: '380px' }}>
              {Object.entries(groups).map(([group, cmds]) => (
                <div key={group}>
                  {/* Group label — barely visible */}
                  <div
                    className="px-5 pt-3 pb-1 text-[9px] font-semibold uppercase tracking-[0.14em]"
                    style={{ color: 'rgba(255,255,255,0.22)', fontFamily: MONO }}
                  >
                    {group}
                  </div>

                  {cmds.map(cmd => {
                    const Icon     = cmd.icon;
                    const idx      = filtered.indexOf(cmd);
                    const isActive = idx === cursor;

                    return (
                      <button
                        key={cmd.id}
                        data-active={isActive}
                        className="w-full flex items-center gap-3.5 px-5 py-3 text-left
                                   transition-colors duration-75 relative"
                        style={{
                          backgroundColor: isActive ? 'rgba(255,255,255,0.06)' : 'transparent',
                          color: isActive ? 'var(--color-text-primary)' : 'rgba(255,255,255,0.55)',
                        }}
                        onMouseEnter={() => { setCursor(idx); playTick(); }}
                        onClick={cmd.action}
                      >
                        {/* Active accent bar */}
                        {isActive && (
                          <span
                            className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] rounded-full"
                            style={{ height: '60%', backgroundColor: 'var(--color-accent)' }}
                          />
                        )}
                        <Icon
                          className="w-[18px] h-[18px] flex-shrink-0"
                          style={{ color: isActive ? 'var(--color-accent)' : 'rgba(255,255,255,0.3)' }}
                        />
                        <span className="flex-1 text-[0.95rem] font-medium">{cmd.label}</span>
                        {isActive && (
                          <ArrowRight
                            className="w-4 h-4 flex-shrink-0"
                            style={{ color: 'var(--color-accent)', opacity: 0.7 }}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              ))}

              {filtered.length === 0 && (
                <div
                  className="px-5 py-12 text-center"
                  style={{ color: 'rgba(255,255,255,0.22)', fontFamily: MONO, fontSize: '13px' }}
                >
                  No results for &quot;{query}&quot;
                </div>
              )}
            </div>

            {/* ── Footer — minimal keyboard hints ── */}
            <div
              className="flex items-center gap-5 px-5 py-2.5 text-[10px]"
              style={{
                borderTop: '1px solid rgba(255,255,255,0.05)',
                color: 'rgba(255,255,255,0.22)',
                fontFamily: MONO,
              }}
            >
              <span><kbd>↑↓</kbd> navigate</span>
              <span><kbd>↵</kbd> run</span>
              <span><kbd>ESC</kbd> close</span>
              <span className="ml-auto">⌘K</span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
