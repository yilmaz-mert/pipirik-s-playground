// src/components/Navbar/Navbar.jsx
import { NavLink } from 'react-router-dom';
import DesktopMenu from './DesktopMenu';
import LanguageSwitcher from './LanguageSwitcher';
import MobileMenu from './MobileMenu';

function Navbar() {
  return (
    <nav
      className="backdrop-blur-md h-18 border-b sticky top-0 z-1000 transition-all duration-300"
      style={{
        backgroundColor: 'var(--color-bg-navbar)',
        borderColor: 'var(--color-border)',
      }}
    >
      <div className="max-w-300 w-full h-full mx-auto flex justify-between items-center px-8 relative">

        <NavLink
          to="/"
          className="text-2xl font-bold tracking-tight shrink-0"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Pipirik's{' '}
          <span className="bg-linear-to-r from-[var(--color-accent)] to-[var(--color-accent-2)] bg-clip-text text-transparent">
            Playground
          </span>
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
