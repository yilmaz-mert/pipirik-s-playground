// src/components/Navbar/LanguageSwitcher.jsx
import { useTranslation } from 'react-i18next';
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@heroui/react";
import { langs } from '../../constants/langs';

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  
  const current = langs.find(l => l.code === ((i18n.language || 'en').split('-')[0])) || langs[0];
  const CurrentFlag = current.Flag;

  const changeLang = (lng) => {
    try { localStorage.setItem('i18nextLng', lng); } catch { /* empty */ }
    i18n.changeLanguage(lng);
  };

  return (
    <div className="hidden lg:flex items-center group">
      {/* CSS'te .lang-switcher::before ile yaptığın o dikine ayracı Tailwind ile çizdik */}
      <div className="w-px h-6 bg-slate-400/15 mr-3 rounded-[1px]" />
      
      <Dropdown 
        placement="bottom-end"
        classNames={{ content: "bg-slate-900/98 backdrop-blur-xl border border-white/10 shadow-2xl rounded-xl min-w-36 p-1" }}
      >
        <DropdownTrigger>
          {/* O güzel hover efektleri ve derinlik Tailwind sınıflarına döküldü */}
          <button className="outline-none focus:outline-none flex items-center gap-2 px-4 py-2 rounded-xl text-[0.95rem] font-medium text-slate-100 bg-white/5 border border-white/5 transition-all duration-200 hover:bg-cyan-500/10 hover:border-cyan-500/30 hover:text-cyan-400" aria-haspopup="listbox">
            <span className="flex items-center"><CurrentFlag className="w-5 h-5 rounded-sm" aria-hidden="true"/></span>
            <span className="transition-transform duration-200 opacity-80 group-hover:rotate-180 group-hover:text-cyan-400">▾</span>
          </button>
        </DropdownTrigger>
        <DropdownMenu 
          aria-label="Language selection" 
          onAction={(key) => changeLang(key)}
          itemClasses={{ base: "hover:bg-white/5 data-[hover=true]:bg-white/5 data-[hover=true]:text-cyan-400 py-2 rounded-lg transition-colors" }}
        >
          {langs.map(l => {
            const ItemFlag = l.Flag;
            return (
              <DropdownItem 
                key={l.code} 
                startContent={<ItemFlag className="w-5 h-5 rounded-sm" />}
                className={i18n.language === l.code ? "text-cyan-400 font-bold" : "text-slate-200"}
              >
                {l.label}
              </DropdownItem>
            );
          })}
        </DropdownMenu>
      </Dropdown>
    </div>
  );
}
