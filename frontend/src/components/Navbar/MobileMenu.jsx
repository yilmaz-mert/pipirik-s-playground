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
  const hamburgerRef = useRef(null);

  useClickOutside(mobileMenuRef, () => {
    setMobileOpen(false);
    setMobileLangOpen(false);
  }, [hamburgerRef]);

  const current = langs.find(l => l.code === ((i18n.language || 'en').split('-')[0])) || langs[0];
  const CurrentFlag = current.Flag;

  const changeLang = (lng) => {
    try { localStorage.setItem('i18nextLng', lng); } catch { /* empty */ }
    i18n.changeLanguage(lng);
  };

  useEffect(() => {
    if (mobileOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const mobileItemClass = "flex items-center px-4 py-3 text-slate-200 text-base font-medium rounded-xl transition-all duration-200 hover:bg-cyan-500/10 hover:text-cyan-400 hover:pl-5 aria-[current=page]:bg-cyan-500/10 aria-[current=page]:text-cyan-400 aria-[current=page]:font-semibold";

  // Buton yapısını tekrar etmemek için bir yardımcı fonksiyon
  const renderHamburger = (isFixed = false) => (
    <button 
      ref={hamburgerRef}
      // isFixed true ise (Portal içindeyse) fixed pozisyon ile aynı yere sabitliyoruz
      className={`${isFixed ? 'fixed right-8 top-4' : 'relative'} p-2 rounded-md bg-transparent border-none outline-none flex flex-col justify-center items-center w-10 h-10 gap-1.5 focus:outline-none z-1300`} 
      aria-label="Menu" 
      onClick={() => setMobileOpen(v => !v)}
    >
      <span className={`block w-6 h-0.5 bg-[#e6eef8] transition-all duration-300 origin-center ${mobileOpen ? 'translate-y-2 rotate-45' : ''}`}></span>
      <span className={`block w-6 h-0.5 bg-[#e6eef8] transition-all duration-300 ${mobileOpen ? 'opacity-0 translate-x-2' : 'opacity-100'}`}></span>
      <span className={`block w-6 h-0.5 bg-[#e6eef8] transition-all duration-300 origin-center ${mobileOpen ? '-translate-y-2 -rotate-45' : ''}`}></span>
    </button>
  );

  return (
    <div className="lg:hidden flex items-center">
      {/* 1. Menü Kapalıyken Normal Navbar'da Duran Buton */}
      {!mobileOpen && renderHamburger(false)}

      {/* 2. Menü Açıkken Her Şeyi Body'ye (Portal) Işınlıyoruz */}
      {mobileOpen && createPortal(
        <>
          {/* Karartma Tabakası */}
          <div 
            className="fixed inset-0 bg-black/60 z-1100 backdrop-blur-md transition-opacity duration-300" 
            aria-hidden="true"
            onClick={() => setMobileOpen(false)}
          />

          {/* X Butonu (Portalda olduğu için karartmanın üstünde çıkar) */}
          {renderHamburger(true)}

          {/* Menü İçeriği */}
          <div 
            ref={mobileMenuRef}
            className="fixed right-4 top-20 bg-slate-900/98 backdrop-blur-2xl border border-white/10 p-2.5 rounded-[18px] min-w-60 shadow-2xl z-1200 animate-in fade-in slide-in-from-top-2 duration-200"
          >
            <div className="flex flex-col gap-1 mb-2">
              <NavLink to="/" className={mobileItemClass} onClick={() => setMobileOpen(false)}>{t('nav.home')}</NavLink>
              <NavLink to="/about" className={mobileItemClass} onClick={() => setMobileOpen(false)}>{t('nav.about')}</NavLink>
              <NavLink to="/projects" className={mobileItemClass} onClick={() => setMobileOpen(false)}>{t('nav.projects')}</NavLink>
            </div>
            
            <div className="h-px bg-white/5 my-2 mx-3" />
            
            <div className="p-1">
              <button 
                 className="w-full flex items-center gap-3 px-4 py-3 bg-white/5 border border-white/5 rounded-xl text-slate-400 text-sm transition-all duration-200 hover:bg-white/10 hover:text-slate-50"
                 onClick={() => setMobileLangOpen(v => !v)}
              >
                <CurrentFlag className="w-5 h-5 rounded-sm" aria-hidden="true"/>
                <span className="font-medium">{current.label}</span>
              </button>

              <div className={`overflow-hidden transition-all duration-200 ease-in-out flex flex-col ${mobileLangOpen ? 'max-h-96 opacity-100 mt-1' : 'max-h-0 opacity-0'}`}>
                {langs.filter(l => l.code !== (i18n.language || 'en')).map(l => {
                  const OptionFlag = l.Flag;
                  return (
                    <button 
                      key={l.code} 
                      className="w-full flex items-center gap-3 px-4 py-3 mt-1 rounded-xl text-left text-sm transition-colors duration-200 text-slate-400 hover:bg-white/5 hover:text-slate-50"
                      onClick={() => { changeLang(l.code); setMobileOpen(false); setMobileLangOpen(false); }}
                    >
                      <OptionFlag className="w-5 h-5 rounded-sm" aria-hidden="true"/>
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