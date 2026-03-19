/**
 * CommandPalette — Global CMD+K / CTRL+K launcher.
 *
 * A custom Framer Motion implementation that matches the existing design system:
 *   - Same backdropFilter + color tokens as the Floating Dock
 *   - Grouped commands with header labels
 *   - Arrow-key navigation + Enter to execute
 *   - Escape / backdrop click to close
 *
 * Commands: Navigation · System (theme, engineer, mute) · Language · Danger Zone
 *
 * Props:
 *   onMatrixRain() — callback to trigger the Easter egg canvas
 */
import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Home, User, LayoutGrid,
  Palette, Code2, Globe,
  Volume2, VolumeX, Terminal,
  ChevronRight,
} from 'lucide-react';
import { useTheme }        from '../../context/ThemeContext';
import { useEngineerMode } from '../../context/EngineerModeContext';
import { useSound }        from '../../context/SoundContext';
import { useTranslation }  from 'react-i18next';
import { langs }           from '../../constants/langs';

const MONO = "ui-monospace, 'Cascadia Code', 'Fira Code', Consolas, monospace";

// ── Command Palette component ─────────────────────────────────────────────────
export default function CommandPalette({ onMatrixRain }) {
  const [open,   setOpen]   = useState(false);
  const [query,  setQuery]  = useState('');
  const [cursor, setCursor] = useState(0);
  const inputRef  = useRef(null);
  const listRef   = useRef(null);

  const navigate = useNavigate();
  const { cycleTheme, theme }                           = useTheme();
  const { active: engineerOn, toggle: toggleEngineer }  = useEngineerMode();
  const { muted, toggleMute, playTick }                 = useSound();
  const { i18n }                                        = useTranslation();

  const close = useCallback(() => {
    setOpen(false);
    setQuery('');
    setCursor(0);
  }, []);

  // ── CMD+K global shortcut + custom event ────────────────────────────────────
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
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
  }, [open, close]);

  // Focus input after open
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 40);
  }, [open]);

  // ── Command list (rebuilt when reactive values change) ──────────────────────
  const commands = useMemo(() => [
    {
      id: 'home',
      icon: Home,
      label: 'Go to Home',
      group: 'Navigation',
      action: () => { navigate('/');        close(); },
    },
    {
      id: 'about',
      icon: User,
      label: 'Go to About',
      group: 'Navigation',
      action: () => { navigate('/about');   close(); },
    },
    {
      id: 'projects',
      icon: LayoutGrid,
      label: 'Go to Projects',
      group: 'Navigation',
      action: () => { navigate('/projects'); close(); },
    },
    {
      id: 'theme',
      icon: Palette,
      label: `Cycle Theme  ›  ${theme}`,
      group: 'System',
      action: () => { cycleTheme(); close(); },
    },
    {
      id: 'engineer',
      icon: Code2,
      label: engineerOn ? 'Disable Engineer Mode' : 'Enable Engineer Mode',
      group: 'System',
      action: () => { toggleEngineer(); close(); },
    },
    {
      id: 'mute',
      icon: muted ? Volume2 : VolumeX,
      label: muted ? 'Unmute Sounds' : 'Mute Sounds',
      group: 'System',
      action: () => { toggleMute(); close(); },
    },
    ...langs.map(l => ({
      id:     `lang-${l.code}`,
      icon:   Globe,
      label:  `Switch Language  ›  ${l.label}`,
      group:  'Language',
      action: () => { i18n.changeLanguage(l.code); close(); },
    })),
    {
      id: 'matrix',
      icon: Terminal,
      label: 'Execute Matrix Protocol',
      group: '⚠ Danger Zone',
      action: () => { onMatrixRain?.(); close(); },
    },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ], [theme, engineerOn, muted, i18n.language, navigate, cycleTheme, toggleEngineer, toggleMute, close, onMatrixRain]);

  // ── Filter + group ──────────────────────────────────────────────────────────
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

  // ── Arrow key / Enter navigation ────────────────────────────────────────────
  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setCursor(v => Math.min(v + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setCursor(v => Math.max(v - 1, 0));
    } else if (e.key === 'Enter') {
      filtered[cursor]?.action();
    }
  };

  // Reset cursor when filter changes
  useEffect(() => setCursor(0), [query]);

  // Scroll active item into view
  useEffect(() => {
    const el = listRef.current?.querySelector('[data-active="true"]');
    el?.scrollIntoView({ block: 'nearest' });
  }, [cursor]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* ── Backdrop ── */}
          <motion.div
            key="cp-bg"
            className="fixed inset-0 z-[2000]"
            style={{ backgroundColor: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{    opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={close}
          />

          {/* ── Panel ── */}
          <motion.div
            key="cp-panel"
            className="fixed z-[2001] left-1/2 top-[18vh] w-[calc(100%-2rem)] max-w-[520px]
                       -translate-x-1/2 rounded-2xl overflow-hidden"
            style={{
              backgroundColor:      'var(--color-bg-overlay)',
              border:               '1px solid var(--color-border)',
              backdropFilter:       'blur(36px)',
              WebkitBackdropFilter: 'blur(36px)',
              boxShadow: [
                '0 28px 80px rgba(0,0,0,0.70)',
                '0 1px 0 color-mix(in srgb, white 8%, transparent) inset',
              ].join(', '),
            }}
            initial={{ opacity: 0, y: -18, scale: 0.97 }}
            animate={{ opacity: 1, y: 0,   scale: 1    }}
            exit={{    opacity: 0, y: -12, scale: 0.97 }}
            transition={{ duration: 0.18, ease: [0.2, 0, 0.2, 1] }}
            // Prevent backdrop click firing through the panel
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search row */}
            <div
              className="flex items-center gap-3 px-4 py-3.5"
              style={{ borderBottom: '1px solid var(--color-border-subtle)' }}
            >
              <Terminal className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--color-accent)' }} />
              <input
                ref={inputRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Type a command..."
                className="flex-1 bg-transparent outline-none text-sm"
                style={{ color: 'var(--color-text-primary)', caretColor: 'var(--color-accent)', fontFamily: MONO }}
              />
              <kbd
                className="text-[10px] px-1.5 py-0.5 rounded font-mono opacity-50 flex-shrink-0"
                style={{
                  backgroundColor: 'var(--color-bg-surface)',
                  border:          '1px solid var(--color-border-subtle)',
                  color:           'var(--color-text-muted)',
                }}
              >ESC</kbd>
            </div>

            {/* Command list */}
            <div ref={listRef} className="overflow-y-auto py-1.5" style={{ maxHeight: '320px' }}>
              {Object.entries(groups).map(([group, cmds]) => (
                <div key={group}>
                  {/* Group label */}
                  <div
                    className="px-4 pt-2.5 pb-1 text-[10px] font-semibold uppercase tracking-widest"
                    style={{ color: 'var(--color-text-muted)', fontFamily: MONO }}
                  >
                    {group}
                  </div>

                  {cmds.map((cmd) => {
                    const Icon     = cmd.icon;
                    const idx      = filtered.indexOf(cmd);
                    const isActive = idx === cursor;

                    return (
                      <button
                        key={cmd.id}
                        data-active={isActive}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors duration-100"
                        style={{
                          backgroundColor: isActive
                            ? 'color-mix(in srgb, var(--color-accent) 10%, transparent)'
                            : 'transparent',
                          color: isActive
                            ? 'var(--color-text-primary)'
                            : 'var(--color-text-secondary)',
                        }}
                        onMouseEnter={() => { setCursor(idx); playTick(); }}
                        onClick={cmd.action}
                      >
                        <Icon
                          className="w-4 h-4 flex-shrink-0"
                          style={{ color: isActive ? 'var(--color-accent)' : 'var(--color-text-muted)' }}
                        />
                        <span className="flex-1">{cmd.label}</span>
                        {isActive && (
                          <ChevronRight
                            className="w-3.5 h-3.5 flex-shrink-0 opacity-60"
                            style={{ color: 'var(--color-accent)' }}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              ))}

              {filtered.length === 0 && (
                <div
                  className="px-4 py-10 text-center text-sm"
                  style={{ color: 'var(--color-text-muted)', fontFamily: MONO }}
                >
                  No commands match &quot;{query}&quot;
                </div>
              )}
            </div>

            {/* Footer */}
            <div
              className="flex gap-4 px-4 py-2 text-[10px]"
              style={{
                borderTop:  '1px solid var(--color-border-subtle)',
                color:      'var(--color-text-muted)',
                fontFamily: MONO,
              }}
            >
              <span><kbd className="opacity-70">↑↓</kbd> navigate</span>
              <span><kbd className="opacity-70">↵</kbd> select</span>
              <span><kbd className="opacity-70">ESC</kbd> close</span>
              <span className="ml-auto opacity-50">⌘K</span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
