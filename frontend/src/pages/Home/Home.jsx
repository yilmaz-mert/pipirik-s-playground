// src/pages/Home/Home.jsx
import React from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import HeroSection    from './components/HeroSection';
import SkillsList     from './components/SkillsList';
import SocialLinks    from './components/SocialLinks';
import ProfileSection from './components/ProfileSection';

// ── IDE Line-Number Gutter ────────────────────────────────────────────────────
// Fixed left-edge decoration that mimics a VS Code / terminal sidebar.
// Opacity 10% — purely ambient, never competes with content.
function IDEGutter() {
  return (
    <div
      className="fixed left-0 top-0 bottom-0 flex flex-col pt-6 pl-2 gap-0"
      style={{
        zIndex:        2,
        pointerEvents: 'none',
        userSelect:    'none',
        width:         '2.4rem',
        opacity:       0.10,
        fontFamily:    "ui-monospace, 'Cascadia Code', 'Fira Code', Consolas, monospace",
        fontSize:      '10px',
        lineHeight:    '1.72',
        color:         'var(--color-text-secondary)',
        textAlign:     'right',
        paddingRight:  '6px',
        overflowY:     'hidden',
      }}
      aria-hidden="true"
    >
      {Array.from({ length: 60 }, (_, i) => (
        <span key={i + 1}>{i + 1}</span>
      ))}
    </div>
  );
}

// ── Home Page ─────────────────────────────────────────────────────────────────
const Home = () => {
  return (
    <main
      data-comp="Home"
      className="relative z-10 flex items-center justify-center overflow-hidden"
      style={{ minHeight: 'calc(100dvh - var(--dock-height) - 3rem)' }}
    >
      <IDEGutter />

      <div className="mx-auto w-full px-6 sm:px-12 lg:px-16 max-w-7xl h-full flex items-center">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8 items-center w-full py-2">

          {/* Left column — text content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="order-2 lg:order-1 flex flex-col items-center lg:items-start
                       text-center lg:text-left space-y-2 relative"
          >
            <HeroSection />
            <SkillsList />
            <SocialLinks />
          </motion.div>

          {/* Right column — profile visual */}
          <div className="order-1 lg:order-2">
            <ProfileSection />
          </div>

        </div>
      </div>
    </main>
  );
};

export default Home;
