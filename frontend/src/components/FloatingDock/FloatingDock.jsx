/**
 * FloatingDock — macOS-style bottom navigation dock.
 *
 * FISHEYE ENGINE:
 *   mouseX (useMotionValue) is set on every mousemove over the dock.
 *   Each MagnifiableItem derives its distance from the cursor centre and maps
 *   that to a size using useTransform + useSpring for physics-based scaling.
 *   Items grow upward (items-end) just like the real macOS Dock.
 *
 * SECTIONS:
 *   [ Home | About | Projects ]  ──  [ Lang | Theme | Engineer ]
 */
import { useRef, useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  motion, AnimatePresence,
  useMotionValue, useTransform, useSpring,
} from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Home, User, LayoutGrid, Palette, Code2 } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useEngineerMode } from '../../context/EngineerModeContext';
import { langs } from '../../constants/langs';
import { useClickOutside } from '../../hooks/useClickOutside';

// ── Fisheye constants ────────────────────────────────────────────────────────
const BASE   = 44;   // px — resting container size
const PEAK   = 72;   // px — maximum size directly under cursor
const RADIUS = 128;  // px — half-width of the magnification influence zone
const SPRING = { mass: 0.08, stiffness: 220, damping: 16 };

// ── Tooltip spring (subtle bounce) ──────────────────────────────────────────
const TIP_VARIANTS = {
  hidden: { opacity: 0, y: 6,  scale: 0.88 },
  show:   { opacity: 1, y: 0,  scale: 1    },
};

// ── MagnifiableItem ──────────────────────────────────────────────────────────
// Wraps any dock slot with fisheye magnification + a floating label tooltip.
function MagnifiableItem({ mouseX, label, children }) {
  const ref = useRef(null);
  const [hovered, setHovered] = useState(false);

  // Distance between cursor and the horizontal centre of this item
  const distance = useTransform(mouseX, (x) => {
    if (x === Infinity) return RADIUS + 1; // cursor outside dock → base size
    const b = ref.current?.getBoundingClientRect();
    return b ? x - (b.left + b.width / 2) : RADIUS + 1;
  });

  const rawSize = useTransform(
    distance,
    [-RADIUS, 0, RADIUS],
    [BASE, PEAK, BASE],
    { clamp: true },
  );
  const size = useSpring(rawSize, SPRING);

  return (
    <div
      className="relative flex flex-col items-center justify-end"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Label chip — floats above the item */}
      <AnimatePresence>
        {hovered && (
          <motion.span
            key="tip"
            variants={TIP_VARIANTS}
            initial="hidden"
            animate="show"
            exit="hidden"
            transition={{ duration: 0.1, ease: 'easeOut' }}
            className="absolute bottom-full mb-2.5 px-2.5 py-[5px] rounded-lg
                       text-[11px] font-semibold tracking-wide whitespace-nowrap
                       pointer-events-none select-none z-20"
            style={{
              backgroundColor: 'var(--color-bg-overlay)',
              color:           'var(--color-text-primary)',
              border:          '1px solid var(--color-border)',
              boxShadow:       '0 4px 14px rgba(0,0,0,0.45)',
            }}
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>

      {/* The magnifiable container — grows upward via items-end on parent */}
      <motion.div
        ref={ref}
        style={{ width: size, height: size }}
        className="flex items-center justify-center"
      >
        {children}
      </motion.div>
    </div>
  );
}

// ── NavItem ──────────────────────────────────────────────────────────────────
// Router-aware dock icon that lights up on the active route.
function NavItem({ mouseX, to, icon: Icon, label }) {
  return (
    <MagnifiableItem mouseX={mouseX} label={label}>
      {/* NavLink render-prop form so isActive flows into both colour + shadow */}
      <NavLink to={to} end={to === '/'} className="w-full h-full block">
        {({ isActive }) => (
          <div
            className="w-full h-full flex items-center justify-center rounded-[10px] transition-colors duration-200"
            style={{
              color:           isActive ? 'var(--color-accent)' : 'var(--color-text-muted)',
              backgroundColor: isActive
                ? 'color-mix(in srgb, var(--color-accent) 13%, transparent)'
                : 'transparent',
              boxShadow:       isActive
                ? '0 0 18px color-mix(in srgb, var(--color-accent) 28%, transparent)'
                : 'none',
            }}
          >
            <Icon
              className="w-[52%] h-[52%]"
              strokeWidth={isActive ? 2 : 1.6}
            />
          </div>
        )}
      </NavLink>
    </MagnifiableItem>
  );
}

// ── DockDivider ──────────────────────────────────────────────────────────────
function DockDivider() {
  return (
    <div
      className="w-px mx-1 flex-shrink-0 self-end rounded-full"
      style={{
        height:          BASE * 0.68 + 'px',
        marginBottom:    BASE * 0.16 + 'px',
        backgroundColor: 'var(--color-border)',
      }}
    />
  );
}

// ── FloatingDock (default export) ────────────────────────────────────────────
export default function FloatingDock() {
  const { t, i18n }                          = useTranslation();
  const { cycleTheme, theme }                = useTheme();
  const { active: engineerOn, toggle: toggleEngineer } = useEngineerMode();

  // Language popover state
  const [langOpen, setLangOpen]   = useState(false);
  const langPanelRef              = useRef(null);
  const langTriggerRef            = useRef(null);
  useClickOutside(langPanelRef, () => setLangOpen(false), [langTriggerRef]);

  // mouseX drives every fisheye calculation
  const mouseX = useMotionValue(Infinity);

  const currentLang = langs.find(
    (l) => l.code === ((i18n.language || 'en').split('-')[0])
  ) || langs[0];
  const CurrentFlag = currentLang.Flag;

  const changeLang = (code) => {
    try { localStorage.setItem('i18nextLng', code); } catch { /* */ }
    i18n.changeLanguage(code);
    setLangOpen(false);
  };

  return (
    <>
      {/* ── Language picker popover ── */}
      <AnimatePresence>
        {langOpen && (
          <motion.div
            ref={langPanelRef}
            key="lang-panel"
            initial={{ opacity: 0, y: 10, scale: 0.93 }}
            animate={{ opacity: 1, y: 0,  scale: 1    }}
            exit={{ opacity: 0,    y: 10, scale: 0.93 }}
            transition={{ duration: 0.18, ease: [0.2, 0, 0.2, 1] }}
            className="fixed z-[1001] flex flex-col gap-0.5 p-1.5 rounded-xl
                       min-w-[9.5rem] backdrop-blur-2xl"
            style={{
              bottom:          'calc(var(--dock-height) + 1.5rem)',
              left:            '50%',
              transform:       'translateX(-50%)',
              backgroundColor: 'var(--color-bg-overlay)',
              border:          '1px solid var(--color-border)',
              boxShadow:       '0 8px 36px rgba(0,0,0,0.55)',
            }}
          >
            {langs.map((l) => {
              const ItemFlag = l.Flag;
              const active   = currentLang.code === l.code;
              return (
                <button
                  key={l.code}
                  onClick={() => changeLang(l.code)}
                  className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg
                             text-sm font-medium transition-colors duration-150 text-left"
                  style={{
                    color:           active ? 'var(--color-accent)'          : 'var(--color-text-secondary)',
                    backgroundColor: active ? 'color-mix(in srgb, var(--color-accent) 10%, transparent)' : 'transparent',
                  }}
                  onMouseEnter={(e) => { if (!active) e.currentTarget.style.backgroundColor = 'var(--color-surface-hover)'; }}
                  onMouseLeave={(e) => { if (!active) e.currentTarget.style.backgroundColor = 'transparent'; }}
                >
                  <ItemFlag className="w-5 h-[15px] rounded-sm flex-shrink-0" aria-hidden="true" />
                  <span>{l.label}</span>
                  {active && (
                    <span
                      className="ml-auto w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: 'var(--color-accent)' }}
                    />
                  )}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Dock bar ── */}
      <motion.nav
        data-comp="FloatingDock"
        aria-label="Main navigation"
        className="fixed z-[1000] flex items-end gap-1.5 px-3 py-2.5 rounded-2xl backdrop-blur-2xl"
        style={{
          bottom:          '1.25rem',
          left:            '50%',
          transform:       'translateX(-50%)',
          backgroundColor: 'var(--color-bg-dock)',
          border:          '1px solid var(--color-border-subtle)',
          boxShadow: [
            '0 8px 40px rgba(0,0,0,0.55)',
            '0 1px 0 color-mix(in srgb, white 7%, transparent) inset',
            '0 0 0 1px color-mix(in srgb, var(--color-accent) 4%, transparent)',
          ].join(', '),
        }}
        onMouseMove={(e) => mouseX.set(e.clientX)}
        onMouseLeave={() => mouseX.set(Infinity)}
      >
        {/* Navigation */}
        <NavItem mouseX={mouseX} to="/"        icon={Home}       label={t('nav.home')} />
        <NavItem mouseX={mouseX} to="/about"   icon={User}       label={t('nav.about')} />
        <NavItem mouseX={mouseX} to="/projects" icon={LayoutGrid} label={t('nav.projects')} />

        <DockDivider />

        {/* Language switcher — shows current flag, opens picker on click */}
        <MagnifiableItem
          mouseX={mouseX}
          label={t('dock.language', 'Language')}
        >
          <button
            ref={langTriggerRef}
            onClick={() => setLangOpen((v) => !v)}
            className="w-full h-full flex items-center justify-center rounded-[10px]
                       transition-colors duration-200"
            style={{
              color:           langOpen ? 'var(--color-accent)' : 'var(--color-text-muted)',
              backgroundColor: langOpen
                ? 'color-mix(in srgb, var(--color-accent) 12%, transparent)'
                : 'transparent',
            }}
            aria-label="Switch language"
            aria-expanded={langOpen}
          >
            <CurrentFlag className="w-[50%] h-[38%] rounded-[3px]" aria-hidden="true" />
          </button>
        </MagnifiableItem>

        {/* Theme cycler — visual cue; cycles THEMES array in ThemeContext */}
        <MagnifiableItem
          mouseX={mouseX}
          label={`${t('dock.theme', 'Theme')}: ${theme}`}
        >
          <button
            onClick={cycleTheme}
            className="w-full h-full flex items-center justify-center rounded-[10px]
                       transition-colors duration-200"
            style={{ color: 'var(--color-text-muted)' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-accent)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-text-muted)'; }}
            aria-label="Cycle theme"
          >
            <Palette className="w-[52%] h-[52%]" strokeWidth={1.6} />
          </button>
        </MagnifiableItem>

        {/* Engineer Mode toggle */}
        <MagnifiableItem
          mouseX={mouseX}
          label={engineerOn ? 'Engineer Mode ON  (Alt+E)' : 'Engineer Mode (Alt+E)'}
        >
          <button
            onClick={toggleEngineer}
            className="w-full h-full flex items-center justify-center rounded-[10px]
                       transition-all duration-200"
            style={{
              color:           engineerOn ? 'var(--color-accent)' : 'var(--color-text-muted)',
              backgroundColor: engineerOn
                ? 'color-mix(in srgb, var(--color-accent) 12%, transparent)'
                : 'transparent',
              boxShadow:       engineerOn
                ? '0 0 16px color-mix(in srgb, var(--color-accent) 32%, transparent)'
                : 'none',
            }}
            aria-label="Toggle engineer mode"
            aria-pressed={engineerOn}
          >
            <Code2
              className="w-[52%] h-[52%]"
              strokeWidth={engineerOn ? 2.1 : 1.6}
            />
          </button>
        </MagnifiableItem>
      </motion.nav>
    </>
  );
}
