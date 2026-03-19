/**
 * FloatingDock — macOS-style bottom navigation dock.
 *
 * FISHEYE ENGINE:
 *   mouseX (useMotionValue) is set on every mousemove over the dock.
 *   Each MagnifiableItem derives its distance from the cursor centre and maps
 *   that to a size using useTransform + useSpring for physics-based scaling.
 *   Items grow upward (items-end) just like the real macOS Dock.
 *
 * RESPONSIVE:
 *   On screens < 640 px (sm breakpoint) BASE/PEAK/RADIUS shrink so the dock
 *   fits comfortably without covering page content. The values are computed
 *   once at mount — the dock is never conditionally rendered.
 *
 * SECTIONS:
 *   [ Home | About | Projects ]  ──  [ Globe(Lang) | Theme | Engineer ]
 */
import { useRef, useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  motion, AnimatePresence,
  useMotionValue, useTransform, useSpring,
} from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Home, User, LayoutGrid, Palette, Code2, Globe } from 'lucide-react';
import { useTheme }        from '../../context/ThemeContext';
import { useEngineerMode } from '../../context/EngineerModeContext';
import { useSound }        from '../../context/SoundContext';
import { langs }           from '../../constants/langs';
import { useClickOutside } from '../../hooks/useClickOutside';

// ── Fisheye spring ────────────────────────────────────────────────────────────
const SPRING = { mass: 0.08, stiffness: 220, damping: 16 };

// ── Tooltip spring ────────────────────────────────────────────────────────────
const TIP_VARIANTS = {
  hidden: { opacity: 0, y: 6,  scale: 0.88 },
  show:   { opacity: 1, y: 0,  scale: 1    },
};

// ── MagnifiableItem ──────────────────────────────────────────────────────────
function MagnifiableItem({ mouseX, label, base, peak, radius, onHoverSound, children }) {
  const ref = useRef(null);
  const [hovered, setHovered] = useState(false);

  const distance = useTransform(mouseX, (x) => {
    if (x === Infinity) return radius + 1;
    const b = ref.current?.getBoundingClientRect();
    return b ? x - (b.left + b.width / 2) : radius + 1;
  });

  const rawSize = useTransform(
    distance,
    [-radius, 0, radius],
    [base, peak, base],
    { clamp: true },
  );
  const size = useSpring(rawSize, SPRING);

  return (
    <div
      className="relative flex flex-col items-center justify-end"
      onMouseEnter={() => { setHovered(true); onHoverSound?.(); }}
      onMouseLeave={() => setHovered(false)}
    >
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
function NavItem({ mouseX, to, icon: Icon, label, base, peak, radius, onHoverSound }) {
  return (
    <MagnifiableItem mouseX={mouseX} label={label} base={base} peak={peak} radius={radius} onHoverSound={onHoverSound}>
      <NavLink to={to} end={to === '/'} className="w-full h-full block">
        {({ isActive }) => (
          <div
            className="w-full h-full flex items-center justify-center rounded-[10px] transition-colors duration-200"
            style={{
              color:           isActive ? 'var(--color-accent)' : 'var(--color-text-muted)',
              backgroundColor: isActive
                ? 'color-mix(in srgb, var(--color-accent) 13%, transparent)'
                : 'transparent',
              boxShadow: isActive
                ? '0 0 18px color-mix(in srgb, var(--color-accent) 28%, transparent)'
                : 'none',
            }}
          >
            <Icon className="w-[52%] h-[52%]" strokeWidth={isActive ? 2 : 1.6} />
          </div>
        )}
      </NavLink>
    </MagnifiableItem>
  );
}

// ── DockDivider ───────────────────────────────────────────────────────────────
function DockDivider({ base }) {
  return (
    <div
      className="w-px mx-1 flex-shrink-0 self-end rounded-full"
      style={{
        height:          base * 0.68 + 'px',
        marginBottom:    base * 0.16 + 'px',
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
  const { playTick, playWhoosh }             = useSound();

  // Language popover
  const [langOpen, setLangOpen]   = useState(false);
  const langPanelRef              = useRef(null);
  const langTriggerRef            = useRef(null);
  useClickOutside(langPanelRef, () => setLangOpen(false), [langTriggerRef]);

  // Responsive dock sizing — computed once at mount
  const isMobile  = useRef(typeof window !== 'undefined' && window.innerWidth < 640).current;
  const dockBase   = isMobile ? 36 : 44;
  const dockPeak   = isMobile ? 58 : 72;
  const dockRadius = isMobile ? 100 : 128;

  // mouseX sentinel: Infinity means cursor is outside the dock → all items at base size
  const mouseX = useMotionValue(Infinity);

  const currentLang = langs.find(
    (l) => l.code === ((i18n.language || 'en').split('-')[0])
  ) || langs[0];

  const changeLang = (code) => {
    try { localStorage.setItem('i18nextLng', code); } catch { /* quota */ }
    i18n.changeLanguage(code);
    setLangOpen(false);
  };

  return (
    <>
      {/* ── Language picker — horizontal glassmorphic pill ── */}
      <AnimatePresence>
        {langOpen && (
          <motion.div
            ref={langPanelRef}
            key="lang-panel"
            initial={{ opacity: 0, y: 8, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1    }}
            exit={{    opacity: 0, y: 8, scale: 0.92 }}
            transition={{ duration: 0.16, ease: [0.2, 0, 0.2, 1] }}
            className="fixed z-[1001] flex flex-row gap-1 p-1.5 rounded-2xl"
            style={{
              bottom:               'calc(var(--dock-height) + 1.1rem)',
              left:                 '50%',
              transform:            'translateX(-50%)',
              /* Exact same glass recipe as the dock bar */
              backgroundColor:      'var(--color-bg-dock)',
              backdropFilter:       'blur(28px)',
              WebkitBackdropFilter: 'blur(28px)',
              border:               '1px solid var(--color-border-subtle)',
              boxShadow: [
                '0 8px 40px rgba(0,0,0,0.55)',
                '0 1px 0 color-mix(in srgb, white 7%, transparent) inset',
                '0 0 0 1px color-mix(in srgb, var(--color-accent) 4%, transparent)',
              ].join(', '),
            }}
          >
            {langs.map((l) => {
              const ItemFlag = l.Flag;
              const active   = currentLang.code === l.code;
              return (
                <button
                  key={l.code}
                  onClick={() => changeLang(l.code)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl
                             text-xs font-semibold tracking-wide transition-all duration-150"
                  style={{
                    color:           active ? 'var(--color-accent)'   : 'var(--color-text-muted)',
                    backgroundColor: active
                      ? 'color-mix(in srgb, var(--color-accent) 13%, transparent)'
                      : 'transparent',
                    boxShadow: active
                      ? '0 0 14px color-mix(in srgb, var(--color-accent) 22%, transparent)'
                      : 'none',
                  }}
                  onMouseEnter={(e) => {
                    if (!active) {
                      e.currentTarget.style.color           = 'var(--color-text-secondary)';
                      e.currentTarget.style.backgroundColor = 'var(--color-surface-hover)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!active) {
                      e.currentTarget.style.color           = 'var(--color-text-muted)';
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                  aria-pressed={active}
                >
                  <ItemFlag className="w-4 h-[11px] rounded-[2px] flex-shrink-0" aria-hidden="true" />
                  <span>{l.code.toUpperCase()}</span>
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
        className={`fixed z-[1000] flex items-end backdrop-blur-2xl
                    ${isMobile ? 'gap-1 px-2 py-2 rounded-xl' : 'gap-1.5 px-3 py-2.5 rounded-2xl'}`}
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
        {/* Navigation items */}
        <NavItem mouseX={mouseX} to="/"         icon={Home}       label={t('nav.home')}     base={dockBase} peak={dockPeak} radius={dockRadius} onHoverSound={playTick} />
        <NavItem mouseX={mouseX} to="/about"    icon={User}       label={t('nav.about')}    base={dockBase} peak={dockPeak} radius={dockRadius} onHoverSound={playTick} />
        <NavItem mouseX={mouseX} to="/projects" icon={LayoutGrid} label={t('nav.projects')} base={dockBase} peak={dockPeak} radius={dockRadius} onHoverSound={playTick} />

        <DockDivider base={dockBase} />

        {/* Language switcher — Globe icon opens picker */}
        <MagnifiableItem
          mouseX={mouseX}
          label={t('dock.language', 'Language')}
          base={dockBase}
          peak={dockPeak}
          radius={dockRadius}
          onHoverSound={playTick}
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
            <Globe className="w-[52%] h-[52%]" strokeWidth={1.6} />
          </button>
        </MagnifiableItem>

        {/* Theme cycler */}
        <MagnifiableItem
          mouseX={mouseX}
          label={`${t('dock.theme', 'Theme')}: ${theme}`}
          base={dockBase}
          peak={dockPeak}
          radius={dockRadius}
          onHoverSound={playTick}
        >
          <button
            onClick={() => { cycleTheme(); playWhoosh(); }}
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
          base={dockBase}
          peak={dockPeak}
          radius={dockRadius}
          onHoverSound={playTick}
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
              boxShadow: engineerOn
                ? '0 0 16px color-mix(in srgb, var(--color-accent) 32%, transparent)'
                : 'none',
            }}
            aria-label="Toggle engineer mode"
            aria-pressed={engineerOn}
          >
            <Code2 className="w-[52%] h-[52%]" strokeWidth={engineerOn ? 2.1 : 1.6} />
          </button>
        </MagnifiableItem>
      </motion.nav>
    </>
  );
}
