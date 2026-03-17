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
      {/* Vertical separator */}
      <div className="w-px h-6 mr-3 rounded-[1px] bg-[var(--color-border-subtle)]" />

      <Dropdown
        placement="bottom-end"
        classNames={{
          content: 'backdrop-blur-xl shadow-2xl rounded-xl min-w-36 p-1 border',
        }}
        style={{
          '--heroui-content-bg': 'var(--color-bg-overlay)',
          '--heroui-content-border': 'var(--color-border-subtle)',
        }}
      >
        <DropdownTrigger>
          <button
            aria-haspopup="listbox"
            className="outline-none focus:outline-none flex items-center gap-2 px-4 py-2 rounded-xl text-[0.95rem] font-medium border transition-all duration-200 hover:bg-cyan-500/10 hover:border-cyan-500/30 hover:text-cyan-400"
            style={{
              color: 'var(--color-text-primary)',
              backgroundColor: 'var(--color-bg-surface)',
              borderColor: 'var(--color-border-subtle)',
            }}
          >
            <span className="flex items-center">
              <CurrentFlag className="w-5 h-5 rounded-sm" aria-hidden="true" />
            </span>
            <span className="transition-transform duration-200 opacity-80 group-hover:rotate-180 group-hover:text-cyan-400">▾</span>
          </button>
        </DropdownTrigger>

        <DropdownMenu
          aria-label="Language selection"
          onAction={(key) => changeLang(key)}
          style={{ backgroundColor: 'var(--color-bg-overlay)' }}
          classNames={{
            base: 'border border-[var(--color-border-subtle)]',
          }}
          itemClasses={{
            base: 'hover:bg-white/5 data-[hover=true]:bg-white/5 data-[hover=true]:text-cyan-400 py-2 rounded-lg transition-colors',
          }}
        >
          {langs.map(l => {
            const ItemFlag = l.Flag;
            return (
              <DropdownItem
                key={l.code}
                startContent={<ItemFlag className="w-5 h-5 rounded-sm" />}
                className={i18n.language === l.code ? 'text-cyan-400 font-bold' : ''}
                style={i18n.language !== l.code ? { color: 'var(--color-text-secondary)' } : undefined}
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
