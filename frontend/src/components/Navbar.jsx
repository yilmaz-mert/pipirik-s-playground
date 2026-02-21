import { NavLink } from 'react-router-dom';
import './Navbar.css'; 
import DesktopMenu from './DesktopMenu';
import LanguageSwitcher from './LanguageSwitcher';
import MobileMenu from './MobileMenu';

function Navbar() {
  return (
    // CSS'teki backdrop-blur, border-bottom ve sticky ayarlarını Tailwind'e taşıdık
    <nav className="bg-slate-900/80 backdrop-blur-md h-(--navbar-height) border-b border-slate-700/50 sticky top-0 z-1000 transition-all duration-300">
      <div className="max-w-300 w-full h-full mx-auto flex justify-between items-center px-8 relative">
        
        {/* CSS'teki o gradient logoyu tek satır Tailwind ile çözdük */}
        <NavLink to="/" className="text-2xl font-bold text-slate-50 tracking-tight shrink-0">
          Pipirik's <span className="bg-linear-to-r from-cyan-400 to-violet-500 bg-clip-text text-transparent">Playground</span>
        </NavLink>

        <div className="flex items-center gap-3 ml-auto">
          <DesktopMenu />
          <LanguageSwitcher />
          <MobileMenu />
        </div>

      </div>
    </nav>
  );
}

export default Navbar;