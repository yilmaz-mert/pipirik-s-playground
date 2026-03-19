// src/pages/Home/components/HeroSection.jsx
import { useState, useEffect, useRef } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

// ── Text Scramble / Decode ────────────────────────────────────────────────────
const CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$@#%&!?';
const rnd = () => CHARSET[Math.floor(Math.random() * CHARSET.length)];

/**
 * Scrambles `target` on mount, then resolves character-by-character.
 * Uses rAF + performance.now() so it's frame-rate independent.
 */
function useScramble(target, duration = 900, delay = 0) {
  const scrambled = target.split('').map(c => (c === ' ' ? ' ' : rnd())).join('');
  const [display, setDisplay] = useState(scrambled);
  const targetRef = useRef(target);

  useEffect(() => {
    targetRef.current = target;
    setDisplay(target.split('').map(c => (c === ' ' ? ' ' : rnd())).join(''));

    let raf;
    const startAt = performance.now() + delay;

    const tick = (now) => {
      if (now < startAt) { raf = requestAnimationFrame(tick); return; }
      const t        = Math.min((now - startAt) / duration, 1);
      const revealed = Math.floor(t * targetRef.current.length);
      setDisplay(
        targetRef.current.split('').map((c, i) => {
          if (c === ' ') return ' ';
          return i < revealed ? c : rnd();
        }).join('')
      );
      if (t < 1) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);

  return display;
}

// ── HeroSection ───────────────────────────────────────────────────────────────
export default function HeroSection() {
  const { t } = useTranslation();

  const heroName = t('home.heroTitle', { name: 'Mert' });
  const heroRole = t('home.heroSubtitle');

  const displayName = useScramble(heroName, 850, 80);
  const displayRole = useScramble(heroRole, 700, 520);

  return (
    <header
      data-comp="HeroSection"
      className="flex flex-col items-center md:items-start gap-1 md:gap-3"
    >
      {/* ── Availability badge — pulsing glow via CSS token animation ── */}
      <div
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full w-fit border animate-badge-pulse"
        style={{
          backgroundColor: 'color-mix(in srgb, var(--color-accent) 8%, transparent)',
          borderColor:     'color-mix(in srgb, var(--color-accent) 22%, transparent)',
          fontFamily:      "ui-monospace, 'Cascadia Code', 'Fira Code', Consolas, monospace",
        }}
      >
        <span className="relative flex h-1.5 w-1.5 flex-shrink-0">
          <span
            className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
            style={{ backgroundColor: 'var(--color-accent)' }}
          />
          <span
            className="relative inline-flex rounded-full h-1.5 w-1.5"
            style={{ backgroundColor: 'var(--color-accent)' }}
          />
        </span>
        <span
          className="text-[11px] font-semibold tracking-wider uppercase"
          style={{ color: 'var(--color-accent)' }}
        >
          {t('home.availableForWork')}
        </span>
      </div>

      {/* ── Hero name — scramble decode on mount ── */}
      <h1
        className="text-5xl md:text-8xl font-black tracking-tighter leading-none text-center md:text-left"
        style={{
          color:      'var(--color-text-primary)',
          fontFamily: "ui-monospace, 'Cascadia Code', 'Fira Code', Consolas, monospace",
        }}
      >
        {displayName}
      </h1>

      {/* ── Role — animated gradient + scramble decode + letter-spacing hover ── */}
      <motion.h2
        className="text-2xl md:text-4xl font-bold bg-clip-text text-transparent text-center md:text-left"
        style={{
          backgroundImage: 'linear-gradient(90deg, var(--color-accent), var(--color-accent-2), var(--color-accent))',
          backgroundSize:  '200% 100%',
          animation:       'gradient-shift 4s ease infinite',
          fontFamily:      "ui-monospace, 'Cascadia Code', 'Fira Code', Consolas, monospace",
          letterSpacing:   '0em',
        }}
        whileHover={{ letterSpacing: '0.06em' }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
      >
        {displayRole}
        {/* Blinking terminal cursor — colour override escapes the parent's
            text-transparent so the _ renders in the accent colour, not clear. */}
        <motion.span
          aria-hidden="true"
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.8, repeat: Infinity, repeatType: 'reverse', ease: 'linear' }}
          style={{ color: 'var(--color-accent)', backgroundClip: 'unset', WebkitBackgroundClip: 'unset' }}
        >_</motion.span>
      </motion.h2>

      {/* ── Bio paragraph — centered on mobile, left on desktop ── */}
      <p
        className="text-base md:text-xl leading-snug max-w-xl font-medium pt-2
                   text-center md:text-left mx-auto md:mx-0"
        style={{ color: 'var(--color-text-muted)' }}
      >
        {t('home.specializedPrefix')}{' '}
        <span className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>{t('home.skill1')}</span>
        {' '}{t('home.and', { defaultValue: '&' })}{' '}
        <span className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>{t('home.skill2')}</span>.
        <br className="hidden md:block" />
        <span className="opacity-80 italic text-lg"> Crafting digital experiences where performance meets aesthetics.</span>
      </p>
    </header>
  );
}
