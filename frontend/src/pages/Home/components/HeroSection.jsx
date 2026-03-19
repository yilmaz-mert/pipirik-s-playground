// src/pages/Home/components/HeroSection.jsx
import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

// ── Text Scramble / Decode ────────────────────────────────────────────────────
// Characters sampled during the scramble phase.
const CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$@#%&!?';
const rnd = () => CHARSET[Math.floor(Math.random() * CHARSET.length)];

/**
 * Scrambles `target` on mount, then resolves character-by-character.
 * Uses rAF + performance.now() so it's frame-rate independent.
 * @param {string} target   - The final string to decode into.
 * @param {number} duration - Total decode time in ms.
 * @param {number} delay    - How long to wait before starting (ms).
 */
function useScramble(target, duration = 900, delay = 0) {
  const scrambled = target.split('').map(c => (c === ' ' ? ' ' : rnd())).join('');
  const [display, setDisplay] = useState(scrambled);
  // Avoid re-running the animation when the component re-renders mid-scramble
  const targetRef = useRef(target);

  useEffect(() => {
    targetRef.current = target;
    // Immediately snapshot a new scrambled start whenever the target changes
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

  // Name decodes fast with no delay; role starts after name is mostly resolved.
  const displayName = useScramble(heroName, 850, 80);
  const displayRole = useScramble(heroRole, 700, 520);

  return (
    <header data-comp="HeroSection" className="space-y-1 md:space-y-3">
      {/* Availability badge — technical monospaced pill */}
      <div
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full w-fit border"
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

      {/* Hero name — scramble decode on mount */}
      <h1
        className="text-5xl md:text-8xl font-black tracking-tighter leading-none"
        style={{
          color:      'var(--color-text-primary)',
          fontFamily: "ui-monospace, 'Cascadia Code', 'Fira Code', Consolas, monospace",
        }}
      >
        {displayName}
      </h1>

      {/* Role — animated gradient + scramble decode */}
      <h2
        className="text-2xl md:text-4xl font-bold bg-clip-text text-transparent"
        style={{
          backgroundImage:    'linear-gradient(90deg, var(--color-accent), var(--color-accent-2), var(--color-accent))',
          backgroundSize:     '200% 100%',
          animation:          'gradient-shift 4s ease infinite',
          fontFamily:         "ui-monospace, 'Cascadia Code', 'Fira Code', Consolas, monospace",
        }}
      >
        {displayRole}
      </h2>

      {/* Bio paragraph */}
      <p className="text-base md:text-xl leading-snug max-w-xl font-medium pt-2" style={{ color: 'var(--color-text-muted)' }}>
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
