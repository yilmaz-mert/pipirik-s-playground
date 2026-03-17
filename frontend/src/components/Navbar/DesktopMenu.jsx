// src/components/Navbar/DesktopMenu.jsx
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function DesktopMenu() {
  const { t } = useTranslation();

  // before:* → prevents layout shift when text becomes semibold on active.
  // after:*  → the animated gradient underline on hover / active page.
  const baseClass = [
    'relative inline-flex flex-col items-center justify-center py-2',
    'font-medium text-base tracking-[0.01em]',
    'border-none outline-none bg-transparent',
    'transition-colors duration-300',
    'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]',
    'aria-[current=page]:text-[var(--color-accent)] aria-[current=page]:font-semibold',
    'before:block before:content-[attr(data-text)] before:font-semibold before:h-0 before:overflow-hidden before:invisible',
    'after:content-[""] after:absolute after:w-0 after:h-0.5 after:bottom-0 after:left-0',
    'after:bg-linear-to-r after:from-[var(--color-accent)] after:to-[var(--color-accent-2)]',
    'after:transition-[width] after:duration-300 hover:after:w-full aria-[current=page]:after:w-full',
  ].join(' ');

  return (
    <div className="hidden lg:flex gap-8 items-center">
      <NavLink to="/"        className={baseClass} data-text={t('nav.home')}>{t('nav.home')}</NavLink>
      <NavLink to="/about"   className={baseClass} data-text={t('nav.about')}>{t('nav.about')}</NavLink>
      <NavLink to="/projects" className={baseClass} data-text={t('nav.projects')}>{t('nav.projects')}</NavLink>
    </div>
  );
}
