// src/pages/Home/components/HeroSection.jsx
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { useTranslation } from 'react-i18next';

export default function HeroSection() {
  const { t } = useTranslation();

  return (
    <header className="space-y-1 md:space-y-3">
      {/* Durum Rozeti */}
      <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs md:text-sm font-medium w-fit">
        <span className="relative flex h-2 w-2 mr-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
        </span>
        {t('home.availableForWork')}
      </div>
      
      {/* Ana Başlıklar */}
      <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-white leading-none">
        {t('home.heroTitle', { name: 'Mert' })}
      </h1>
      
      <h2 className="text-2xl md:text-4xl font-bold bg-linear-to-r from-[#38BDF8] to-[#818CF8] bg-clip-text text-transparent">
        {t('home.heroSubtitle')}
      </h2>

      {/* Tanıtım Paragrafı */}
      <p className="text-slate-400 text-base md:text-xl leading-snug max-w-xl font-medium pt-2">
        {t('home.specializedPrefix')}{' '}
        <span className="text-white font-semibold">{t('home.skill1')}</span>
        {' '}{t('home.and') || '&'}{' '}
        <span className="text-white font-semibold">{t('home.skill2')}</span>.
        <br className="hidden md:block" />
        <span className="opacity-80 italic text-lg"> Crafting digital experiences where performance meets aesthetics.</span>
      </p>
    </header>
  );
}