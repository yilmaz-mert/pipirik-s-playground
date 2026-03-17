// src/pages/Home/components/HeroSection.jsx
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { useTranslation } from 'react-i18next';

export default function HeroSection() {
  const { t } = useTranslation();

  return (
    <header data-comp="HeroSection" className="space-y-1 md:space-y-3">
      {/* Availability badge — semantic blue kept intentionally (status indicator, not theme color) */}
      <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs md:text-sm font-medium w-fit">
        <span className="relative flex h-2 w-2 mr-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
        </span>
        {t('home.availableForWork')}
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
