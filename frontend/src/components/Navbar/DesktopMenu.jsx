// src/components/Navbar/DesktopMenu.jsx
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function DesktopMenu() {
  const { t } = useTranslation();
  
  // nav-item sınıfına artık gerek kalmadı. 
  // before:* -> Layout kaymasını engeller.
  // after:* -> Hover olunca ve sayfa aktifken dolan gradient alt çizgiyi oluşturur.
  const baseClass = "relative inline-flex flex-col items-center justify-center py-2 text-slate-400 font-medium text-base tracking-[0.01em] transition-colors duration-300 hover:text-slate-50 border-none outline-none bg-transparent aria-[current=page]:text-cyan-400 aria-[current=page]:font-semibold before:block before:content-[attr(data-text)] before:font-semibold before:h-0 before:overflow-hidden before:invisible after:content-[''] after:absolute after:w-0 after:h-0.5 after:bottom-0 after:left-0 after:bg-gradient-to-r after:from-cyan-400 after:to-violet-500 after:transition-[width] after:duration-300 hover:after:w-full aria-[current=page]:after:w-full";

  return (
    <div className="hidden lg:flex gap-8 items-center">
      <NavLink to="/" className={baseClass} data-text={t('nav.home')}>{t('nav.home')}</NavLink>
      <NavLink to="/about" className={baseClass} data-text={t('nav.about')}>{t('nav.about')}</NavLink>
      <NavLink to="/projects" className={baseClass} data-text={t('nav.projects')}>{t('nav.projects')}</NavLink>
    </div>
  );
}
