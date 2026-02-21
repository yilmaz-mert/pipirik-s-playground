import { NavLink } from 'react-router-dom';
import './Navbar.css'; // Orijinal CSS dosyanı tekrar bağladık
import { useTranslation } from 'react-i18next';
import { useState, useRef, useEffect } from 'react';
import GB from 'country-flag-icons/react/3x2/GB';
import TR from 'country-flag-icons/react/3x2/TR';
import PL from 'country-flag-icons/react/3x2/PL';

function Navbar() {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileLangOpen, setMobileLangOpen] = useState(false);
  const ref = useRef(null);
  const navRef = useRef(null);
  const mobileLangRef = useRef(null);

  const langs = [
    { code: 'en', label: 'English', Flag: GB },
    { code: 'tr', label: 'Türkçe', Flag: TR },
    { code: 'pl', label: 'Polski', Flag: PL }
  ];

  useEffect(() => {
    const onDocClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
      if (navRef.current && !navRef.current.contains(e.target)) setMobileOpen(false);
      if (mobileLangRef.current && mobileLangRef.current.contains(e.target)) return;
      setMobileLangOpen(false);
    };
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);

  const current = langs.find(l => l.code === ((i18n.language || 'en').split('-')[0])) || langs[0];

  const changeLang = (lng) => {
    try {
      localStorage.setItem('i18nextLng', lng);
    } catch {
      // ignore storage errors
    }
    i18n.changeLanguage(lng);
    setOpen(false);
  };

  useEffect(() => {
    if (mobileOpen) document.body.classList.add('mobile-menu-open');
    else document.body.classList.remove('mobile-menu-open');
    return () => document.body.classList.remove('mobile-menu-open');
  }, [mobileOpen]);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <NavLink to="/" className="navbar-logo">
          Pipirik's <span>Playground</span>
        </NavLink>

        <div className="nav-right" ref={navRef}>
          <div className="nav-links">
            <NavLink to="/" className="nav-item" data-text={t('nav.home')}>{t('nav.home')}</NavLink>
            <NavLink to="/about" className="nav-item" data-text={t('nav.about')}>{t('nav.about')}</NavLink>
            <NavLink to="/projects" className="nav-item" data-text={t('nav.projects')}>{t('nav.projects')}</NavLink>
          </div>
          <div className="lang-switcher" ref={ref} aria-label="Language switcher">
              <button className="lang-current" onClick={() => setOpen(s => !s)} aria-haspopup="listbox" aria-expanded={open}>
              <span className="flag"><current.Flag className="inline-block w-5 h-5" aria-hidden="true"/></span>
              <span className="caret">▾</span>
            </button>

            {open && (
              <ul className="lang-dropdown" role="listbox">
                {langs.map(l => (
                    <li key={l.code} className={`lang-option ${i18n.language === l.code ? 'active' : ''}`} onClick={() => changeLang(l.code)} role="option" aria-selected={i18n.language === l.code}>
                    <span className="flag"><l.Flag className="inline-block w-5 h-5" aria-hidden="true"/></span>
                    <span className="label">{l.label}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <button className="hamburger" aria-label="Menu" onClick={() => setMobileOpen(v => !v)}>
            <span className={`hamburger-box ${mobileOpen ? 'open' : ''}`}></span>
          </button>

          {mobileOpen && (
            <div className="mobile-menu">
              <div className="mobile-links">
                <NavLink to="/" className="mobile-item" onClick={() => setMobileOpen(false)}>{t('nav.home')}</NavLink>
                <NavLink to="/about" className="mobile-item" onClick={() => setMobileOpen(false)}>{t('nav.about')}</NavLink>
                <NavLink to="/projects" className="mobile-item" onClick={() => setMobileOpen(false)}>{t('nav.projects')}</NavLink>
              </div>
              <div className="mobile-separator" />
              <div className="mobile-lang" ref={mobileLangRef}>
                <button className="mobile-lang-current" onClick={() => setMobileLangOpen(v => !v)}>
                  <span className="flag"><current.Flag className="inline-block w-5 h-5" aria-hidden="true"/></span>
                  <span className="label">{current.label}</span>
                </button>

                <div className={`mobile-lang-list ${mobileLangOpen ? 'open' : ''}`}>
                  {langs.filter(l => l.code !== (i18n.language || 'en')).map(l => (
                    <button key={l.code} className={`lang-option-mobile ${i18n.language === l.code ? 'active' : ''}`} onClick={() => { changeLang(l.code); setMobileOpen(false); setMobileLangOpen(false); }}>
                      <span className="flag"><l.Flag className="inline-block w-5 h-5" aria-hidden="true"/></span>
                      <span className="label">{l.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;