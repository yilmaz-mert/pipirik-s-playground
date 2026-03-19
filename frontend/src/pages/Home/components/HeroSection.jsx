// src/pages/Home/components/HeroSection.jsx
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { useTranslation } from 'react-i18next';

export default function HeroSection() {
  const { t } = useTranslation();

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
        {/* Blinking active dot */}
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

      {/* Hero name — text-[var] overrides the global h1 gradient so the name stays solid */}
      <h1
        className="text-5xl md:text-8xl font-black tracking-tighter leading-none"
        style={{ color: 'var(--color-text-primary)' }}
      >
        {t('home.heroTitle', { name: 'Mert' })}
      </h1>

      {/* Role gradient — uses accent tokens */}
      <h2 className="text-2xl md:text-4xl font-bold bg-linear-to-r from-[var(--color-accent)] to-[var(--color-accent-2)] bg-clip-text text-transparent">
        {t('home.heroSubtitle')}
      </h2>

      {/* Bio paragraph */}
      <p className="text-base md:text-xl leading-snug max-w-xl font-medium pt-2" style={{ color: 'var(--color-text-muted)' }}>
        {t('home.specializedPrefix')}{' '}
        <span className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>{t('home.skill1')}</span>
        {' '}{t('home.and') || '&'}{' '}
        <span className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>{t('home.skill2')}</span>.
        <br className="hidden md:block" />
        <span className="opacity-80 italic text-lg"> Crafting digital experiences where performance meets aesthetics.</span>
      </p>
    </header>
  );
}
