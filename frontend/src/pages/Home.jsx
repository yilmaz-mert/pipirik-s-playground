// src/pages/Home.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { FaGithub, FaLinkedin } from 'react-icons/fa';
import { Button, Chip } from "@heroui/react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion"; // Framer Motion eklendi
import mertProfile from "../assets/mert-profile.webp";

const Home = () => {
  const { t } = useTranslation();
  const skills = t('home.skills', { returnObjects: true }) || [];

  return (
    <main className="relative z-10 flex items-center justify-center h-[calc(100svh-var(--navbar-height))] overflow-hidden">
      <div 
        className="mx-auto w-full px-6 sm:px-12 lg:px-16 max-w-7xl h-full flex items-center" /* max-w-325 yerine standart Tailwind değeri kullanıldı */
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8 items-center w-full py-2">
          
          {/* Sol Taraf: Metin ve Bilgiler - Framer Motion ile Animasyonlu */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="order-2 lg:order-1 flex flex-col items-center lg:items-start text-center lg:text-left space-y-3"
          >
            <header className="space-y-2">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs md:text-sm font-medium">
                <span className="relative flex h-2 w-2 mr-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                </span>
                {t('home.availableForWork', { defaultValue: 'Available for new opportunities' })}
              </div>
              
              <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-white leading-none">
                {t('home.heroTitle', { name: 'Mert' })}
              </h1>
              
              <h2 className="text-2xl md:text-4xl font-bold bg-linear-to-r from-[#38BDF8] to-[#818CF8] bg-clip-text text-transparent">
                {t('home.heroSubtitle')}
              </h2>
            </header>

            <p className="text-slate-400 text-base md:text-xl leading-snug max-w-xl font-medium">
              {t('home.specializedPrefix')}{' '}
              <span className="text-white font-semibold">{t('home.skill1')}</span>
              {' '}{t('home.and') || '&'}{' '}
              <span className="text-white font-semibold">{t('home.skill2')}</span>.
              <br className="hidden md:block" />
              <span className="opacity-80 italic"> Crafting digital experiences where performance meets aesthetics.</span>
            </p>

            {/* Yetenek Etiketleri - Kademeli (Stagger) Animasyon */}
            <motion.div 
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.3 } }
              }}
              className="flex flex-wrap justify-center lg:justify-start gap-1.5 max-w-md" 
              role="list"
            >
              {skills.map((skill) => (
                <motion.div key={skill} variants={{ hidden: { opacity: 0, scale: 0.8 }, visible: { opacity: 1, scale: 1 } }}>
                  <Chip
                    variant="flat"
                    className="border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 transition-colors cursor-default px-4 h-8"
                  >
                    {skill}
                  </Chip>
                </motion.div>
              ))}
            </motion.div>

            {/* Sosyal Medya Butonları */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="flex items-center justify-center lg:justify-start gap-3 pt-2"
            >
              <Button as="a" href="https://github.com/yilmaz-mert" target="_blank" isIconOnly variant="flat" size="lg" className="bg-white/5 border border-white/10 hover:border-[#38BDF8] text-slate-400 hover:text-[#38BDF8] transition-all h-14 w-14">
                <FaGithub size={24} />
              </Button>
              <Button as="a" href="https://www.linkedin.com/in/yilmaz-mert/" target="_blank" isIconOnly variant="flat" size="lg" className="bg-white/5 border border-white/10 hover:border-[#818CF8] text-slate-400 hover:text-[#818CF8] transition-all h-14 w-14">
                <FaLinkedin size={24} />
              </Button>
            </motion.div>
          </motion.div>

          {/* Sağ Taraf: Profil Fotoğrafı - Framer Motion ile Animasyonlu */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            className="order-1 lg:order-2 flex justify-center lg:justify-end"
          >
            <div className="relative w-44 h-44 md:w-104 md:h-104 group">
              <div className="hidden md:block absolute inset-0 bg-linear-to-tr from-[#38BDF8] to-[#818CF8] opacity-20 blur-[80px] group-hover:opacity-40 transition-opacity duration-700" />
              
              <div 
                /* style prop'u yerine index.css'e eklediğimiz animate-morph sınıfını kullanıyoruz */
                className="relative w-full h-full border-2 border-white/10 bg-[#1e293b] overflow-hidden transition-all duration-1000 ease-in-out group-hover:scale-[1.02] shadow-2xl animate-morph"
              >
                <img 
                  src={mertProfile} 
                  alt="Mert's Profile" 
                  fetchpriority="high"
                  loading="eager"
                  width="420"
                  height="420"
                  className="w-full h-full object-cover scale-110 group-hover:scale-100 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-linear-to-t from-[#0f172a]/60 to-transparent" />
              </div>

              {/* Status Badge - animate-bounce-slow sınıfı artık index.css'ten geliyor */}
              <div className="absolute -bottom-2 -right-2 bg-slate-900/90 backdrop-blur-xl border border-white/20 p-4 rounded-2xl hidden md:flex items-center gap-3 shadow-2xl animate-bounce-slow">
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Status</span>
                  <span className="text-sm font-bold text-white">Developing... 🚀</span>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </main>
  );
};

export default Home;