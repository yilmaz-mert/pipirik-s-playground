import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function DesktopMenu() {
  const { t } = useTranslation();
  
  // Eski .nav-item CSS'lerini Tailwind sınıflarına dönüştürdük
  // aria-[current=page] özelliği, React Router'ın aktif linke otomatik eklediği erişilebilirlik ayarıdır.
  const baseClass = "nav-item relative inline-flex flex-col items-center justify-center py-2 text-slate-400 font-medium text-base tracking-[0.01em] transition-colors duration-300 hover:text-slate-50 border-none outline-none bg-transparent aria-[current=page]:text-cyan-400 aria-[current=page]:font-semibold";

  return (
    <div className="hidden lg:flex gap-8 items-center">
      <NavLink to="/" className={baseClass} data-text={t('nav.home')}>{t('nav.home')}</NavLink>
      <NavLink to="/about" className={baseClass} data-text={t('nav.about')}>{t('nav.about')}</NavLink>
      <NavLink to="/projects" className={baseClass} data-text={t('nav.projects')}>{t('nav.projects')}</NavLink>
    </div>
  );
}