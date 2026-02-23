// src/pages/Home/Home.jsx
import React from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import HeroSection from './components/HeroSection';
import SkillsList from './components/SkillsList';
import SocialLinks from './components/SocialLinks';
import ProfileSection from './components/ProfileSection';

const Home = () => {
  return (
    <main className="relative z-10 flex items-center justify-center h-[calc(100dvh-var(--navbar-height))] overflow-hidden">
      <div className="mx-auto w-full px-6 sm:px-12 lg:px-16 max-w-7xl h-full flex items-center">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8 items-center w-full py-2">
          
          {/* Sol Taraf: Bilgiler */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="order-2 lg:order-1 flex flex-col items-center lg:items-start text-center lg:text-left space-y-2"
          >
            <HeroSection />
            <SkillsList />
            <SocialLinks />
          </motion.div>

          {/* Sağ Taraf: Görsel */}
          <div className="order-1 lg:order-2">
            <ProfileSection />
          </div>

        </div>
      </div>
    </main>
  );
};

export default Home;
