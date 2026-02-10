import { NavLink } from 'react-router-dom';
import './Navbar.css';
import { useTranslation } from 'react-i18next';
import { useState, useRef, useEffect } from 'react';

function Navbar() {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileLangOpen, setMobileLangOpen] = useState(false);
  const ref = useRef(null);
  const navRef = useRef(null);
  const mobileLangRef = useRef(null);

  const langs = [
    { code: 'en', label: 'English', flag: '🇪🇳' },
    { code: 'tr', label: 'Türkçe', flag: '🇹🇷' }
    ,{ code: 'pl', label: 'Polski', flag: '🇵🇱' }
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

  // Toggle a body class so other pages (like Home) can apply a dim overlay
  useEffect(() => {
    if (mobileOpen) document.body.classList.add('mobile-menu-open');
    else document.body.classList.remove('mobile-menu-open');
    return () => document.body.classList.remove('mobile-menu-open');
  }, [mobileOpen]);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Brand/Logo link leading to home */}
        <NavLink to="/" className="navbar-logo">
          {t('nav.logoPart1')} <span>{t('nav.logoPart2')}</span>
        </NavLink>

        <div className="nav-right" ref={navRef}>
          {/* Navigation menu items */}
          <div className="nav-links">
            <NavLink to="/" className="nav-item" data-text={t('nav.home')}>{t('nav.home')}</NavLink>
            <NavLink to="/about" className="nav-item" data-text={t('nav.about')}>{t('nav.about')}</NavLink>
            <NavLink to="/projects" className="nav-item" data-text={t('nav.projects')}>{t('nav.projects')}</NavLink>
          </div>
          <div className="lang-switcher" ref={ref} aria-label="Language switcher">
              <button className="lang-current" onClick={() => setOpen(s => !s)} aria-haspopup="listbox" aria-expanded={open}>
              <span className="flag">{current.flag}</span>
              <span className="caret">▾</span>
            </button>

            {open && (
              <ul className="lang-dropdown" role="listbox">
                {langs.map(l => (
                  <li key={l.code} className={`lang-option ${i18n.language === l.code ? 'active' : ''}`} onClick={() => changeLang(l.code)} role="option" aria-selected={i18n.language === l.code}>
                    <span className="flag">{l.flag}</span>
                    <span className="label">{l.label}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Mobile hamburger */}
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
                  <span className="flag">{current.flag}</span>
                  <span className="label">{current.label}</span>
                </button>

                <div className={`mobile-lang-list ${mobileLangOpen ? 'open' : ''}`}>
                  {langs.filter(l => l.code !== (i18n.language || 'en')).map(l => (
                    <button key={l.code} className={`lang-option-mobile ${i18n.language === l.code ? 'active' : ''}`} onClick={() => { changeLang(l.code); setMobileOpen(false); setMobileLangOpen(false); }}>
                      <span className="flag">{l.flag}</span>
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