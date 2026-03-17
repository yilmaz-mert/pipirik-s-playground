// src/components/Navbar/MobileMenu.jsx
import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useClickOutside } from '../../hooks/useClickOutside';
import { langs } from '../../constants/langs';

export default function MobileMenu() {
  const { t, i18n } = useTranslation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileLangOpen, setMobileLangOpen] = useState(false);

  const mobileMenuRef = useRef(null);
  const hamburgerRef  = useRef(null);

  useClickOutside(mobileMenuRef, () => {
    setMobileOpen(false);
    setMobileLangOpen(false);
  }, [hamburgerRef]);

  const current     = langs.find(l => l.code === ((i18n.language || 'en').split('-')[0])) || langs[0];
  const CurrentFlag = current.Flag;

  const changeLang = (lng) => {
    try { localStorage.setItem('i18nextLng', lng); } catch { /* empty */ }
    i18n.changeLanguage(lng);
  };

  useEffect(() => {
    if (mobileOpen) document.body.style.overflow = 'hidden';
    else            document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  // Nav item skin — uses tokens for semantic colors; accent hover is kept as-is
  const mobileItemClass = [
    'flex items-center px-4 py-3 text-base font-medium rounded-xl',
    'transition-all duration-200',
    'text-[var(--color-text-secondary)]',
    'hover:bg-cyan-500/10 hover:text-cyan-400 hover:pl-5',
    'aria-[current=page]:bg-cyan-500/10 aria-[current=page]:text-cyan-400 aria-[current=page]:font-semibold',
  ].join(' ');

  const renderHamburger = (isFixed = false) => (
    <button
      ref={hamburgerRef}
      className={`${isFixed ? 'fixed right-8 top-4' : 'relative'} p-2 rounded-md bg-transparent border-none outline-none flex flex-col justify-center items-center w-10 h-10 gap-1.5 focus:outline-none z-1300`}
      aria-label="Menu"
      onClick={() => setMobileOpen(v => !v)}
    >
      {/* Hamburger lines — colour tracks --color-text-primary */}
      <span className={`block w-6 h-0.5 bg-[var(--color-text-primary)] transition-all duration-300 origin-center ${mobileOpen ? 'translate-y-2 rotate-45' : ''}`} />
      <span className={`block w-6 h-0.5 bg-[var(--color-text-primary)] transition-all duration-300 ${mobileOpen ? 'opacity-0 translate-x-2' : 'opacity-100'}`} />
      <span className={`block w-6 h-0.5 bg-[var(--color-text-primary)] transition-all duration-300 origin-center ${mobileOpen ? '-translate-y-2 -rotate-45' : ''}`} />
    </button>
  );

  return (
    <div className="lg:hidden flex items-center">
      {!mobileOpen && renderHamburger(false)}

      {mobileOpen && createPortal(
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 z-1100 backdrop-blur-md transition-opacity duration-300"
            aria-hidden="true"
            onClick={() => setMobileOpen(false)}
          />

          {renderHamburger(true)}

          {/* Menu panel */}
          <div
            ref={mobileMenuRef}
            className="fixed right-4 top-20 backdrop-blur-2xl p-2.5 rounded-[18px] min-w-60 shadow-2xl z-1200 animate-in fade-in slide-in-from-top-2 duration-200 border"
            style={{
              backgroundColor: 'var(--color-bg-overlay)',
              borderColor:     'var(--color-border-subtle)',
            }}
          >
            <div className="flex flex-col gap-1 mb-2">
              <NavLink to="/"        className={mobileItemClass} onClick={() => setMobileOpen(false)}>{t('nav.home')}</NavLink>
              <NavLink to="/about"   className={mobileItemClass} onClick={() => setMobileOpen(false)}>{t('nav.about')}</NavLink>
              <NavLink to="/projects" className={mobileItemClass} onClick={() => setMobileOpen(false)}>{t('nav.projects')}</NavLink>
            </div>

            {/* Divider */}
            <div className="h-px my-2 mx-3 bg-[var(--color-border-subtle)]" />

            <div className="p-1">
              {/* Language trigger */}
              <button
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 border"
                style={{
                  backgroundColor: 'var(--color-bg-surface)',
                  borderColor:     'var(--color-border-subtle)',
                  color:           'var(--color-text-muted)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.backgroundColor = 'var(--color-surface-hover)';
                  e.currentTarget.style.color           = 'var(--color-text-primary)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.backgroundColor = 'var(--color-bg-surface)';
                  e.currentTarget.style.color           = 'var(--color-text-muted)';
                }}
                onClick={() => setMobileLangOpen(v => !v)}
              >
                <CurrentFlag className="w-5 h-5 rounded-sm" aria-hidden="true" />
                <span>{current.label}</span>
              </button>

              <div className={`overflow-hidden transition-all duration-200 ease-in-out flex flex-col ${mobileLangOpen ? 'max-h-96 opacity-100 mt-1' : 'max-h-0 opacity-0'}`}>
                {langs.filter(l => l.code !== (i18n.language || 'en')).map(l => {
                  const OptionFlag = l.Flag;
                  return (
                    <button
                      key={l.code}
                      className="w-full flex items-center gap-3 px-4 py-3 mt-1 rounded-xl text-left text-sm transition-colors duration-200"
                      style={{ color: 'var(--color-text-muted)' }}
                      onMouseEnter={e => {
                        e.currentTarget.style.backgroundColor = 'var(--color-bg-surface)';
                        e.currentTarget.style.color           = 'var(--color-text-primary)';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.backgroundColor = '';
                        e.currentTarget.style.color           = 'var(--color-text-muted)';
                      }}
                      onClick={() => { changeLang(l.code); setMobileOpen(false); setMobileLangOpen(false); }}
                    >
                      <OptionFlag className="w-5 h-5 rounded-sm" aria-hidden="true" />
                      <span className="font-medium">{l.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </>,
        document.body
      )}
    </div>
  );
}
