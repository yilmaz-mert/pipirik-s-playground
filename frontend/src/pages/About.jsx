// src/pages/About.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardHeader, CardBody, Chip } from '@heroui/react';
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { Fingerprint, Cpu, Wrench, Globe, Sparkles } from "lucide-react";

const About = () => {
  const { t } = useTranslation();
  const skills = t('about.skills', { returnObjects: true }) || ['React', 'CSS', 'Accessibility'];

  // Framer Motion Ayarları
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  return (
    <main className="relative z-10 w-full overflow-hidden">
      <div className="mx-auto w-full px-6 sm:px-8 md:px-10 lg:px-12 pb-16 max-w-7xl">
        
        {/* Header Kısmı - Animasyonlu */}
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 pt-16 flex flex-col gap-4 items-center"
        >
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-[#F8FAFC] mb-2 pb-1">
            {t('about.titlePart1')}{' '}
            <span className="bg-linear-to-r from-[#38BDF8] to-[#818CF8] bg-clip-text text-transparent">
              {t('about.titlePart2')}
            </span>
          </h1>
          <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto italic font-medium">
            {t('about.subtitle')}
          </p>
        </motion.header>

        {/* Bento Grid Kartları */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 items-stretch"
        >
          
          {/* 1. Kart: DNA / Biyografi */}
          <motion.div variants={itemVariants} className="h-full">
            <Card className="group relative h-full flex flex-col overflow-hidden bg-[#1e293b]/50 backdrop-blur-xl border border-white/5 hover:border-white/10 transition-all duration-500 hover:-translate-y-1 shadow-lg hover:shadow-2xl hover:shadow-cyan-500/10">
              {/* Arka Plan Glow Efekti */}
              <div className="absolute inset-0 bg-linear-to-br from-cyan-500/10 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              {/* Dekoratif Arka Plan İkonu */}
              <Fingerprint className="absolute -left-6 -bottom-6 w-40 h-40 text-white/5 group-hover:text-white/10 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500" />

              <CardHeader className="px-6 pt-8 relative z-10 flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                  <Fingerprint className="w-6 h-6 text-cyan-400" />
                </div>
                <h3 id="dna-title" className="text-2xl font-bold text-slate-100 group-hover:text-cyan-400 transition-colors">
                  {t('about.dnaTitle')}
                </h3>
              </CardHeader>
              
              <CardBody className="px-6 pb-8 pt-4 relative z-10">
                <div 
                  className="text-slate-400 leading-relaxed text-sm md:text-base group-hover:text-slate-300 transition-colors" 
                  dangerouslySetInnerHTML={{ __html: t('about.bioParagraph1') }} 
                />
                <div 
                  className="text-slate-400 leading-relaxed text-sm md:text-base mt-4 group-hover:text-slate-300 transition-colors" 
                  dangerouslySetInnerHTML={{ __html: t('about.bioParagraph2') }} 
                />
              </CardBody>
            </Card>
          </motion.div>

          {/* 2. Kart: Yetkinlikler ve Araçlar */}
          <motion.div variants={itemVariants} className="h-full">
            <Card className="group relative h-full flex flex-col overflow-hidden bg-[#1e293b]/50 backdrop-blur-xl border border-white/5 hover:border-white/10 transition-all duration-500 hover:-translate-y-1 shadow-lg hover:shadow-2xl hover:shadow-purple-500/10">
              {/* Arka Plan Glow Efekti */}
              <div className="absolute inset-0 bg-linear-to-bl from-purple-500/10 to-fuchsia-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              {/* Dekoratif Arka Plan İkonu */}
              <Sparkles className="absolute -right-6 -bottom-6 w-40 h-40 text-white/5 group-hover:text-white/10 group-hover:scale-110 group-hover:-rotate-12 transition-all duration-500" />

              <CardHeader className="px-6 pt-8 relative z-10 flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20">
                  <Sparkles className="w-6 h-6 text-purple-400" />
                </div>
                <h3 id="competencies-title" className="text-2xl font-bold text-slate-100 group-hover:text-purple-400 transition-colors">
                  {t('about.competenciesTitle')}
                </h3>
              </CardHeader>
              
              <CardBody className="px-6 pb-8 pt-4 relative z-10 flex flex-col">
                <ul className="space-y-6 flex-1" role="list" aria-labelledby="competencies-title">
                  <li className="flex gap-4 items-start">
                    <div className="mt-1"><Cpu className="w-5 h-5 text-cyan-400" /></div>
                    <div>
                      <h4 className="text-base font-semibold text-slate-200">{t('about.comp.aiTitle')}</h4>
                      <p className="text-slate-400 text-sm mt-1">{t('about.comp.aiDesc')}</p>
                    </div>
                  </li>
                  <li className="flex gap-4 items-start">
                    <div className="mt-1"><Wrench className="w-5 h-5 text-indigo-400" /></div>
                    <div>
                      <h4 className="text-base font-semibold text-slate-200">{t('about.comp.toolsTitle')}</h4>
                      <p className="text-slate-400 text-sm mt-1">{t('about.comp.toolsDesc')}</p>
                    </div>
                  </li>
                  <li className="flex gap-4 items-start">
                    <div className="mt-1"><Globe className="w-5 h-5 text-emerald-400" /></div>
                    <div>
                      <h4 className="text-base font-semibold text-slate-200">{t('about.comp.intlTitle')}</h4>
                      <p className="text-slate-400 text-sm mt-1">{t('about.comp.intlDesc')}</p>
                    </div>
                  </li>
                </ul>

                {/* Yetenek Chipleri - Tailwind'e geçirildi */}
                <div className="mt-8 pt-6 border-t border-white/5 flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <Chip
                      key={skill}
                      size="sm"
                      variant="flat"
                      className="bg-white/5 text-slate-300 border border-white/5 group-hover:bg-purple-500/10 group-hover:text-purple-300 group-hover:border-purple-500/20 transition-all duration-300 px-3 py-4"
                    >
                      {skill}
                    </Chip>
                  ))}
                </div>
              </CardBody>
            </Card>
          </motion.div>

        </motion.div>
      </div>
    </main>
  );
};

export default About;