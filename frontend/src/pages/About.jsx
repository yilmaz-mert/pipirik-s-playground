// src/pages/About.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardHeader, CardBody, Chip } from '@heroui/react';
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { Fingerprint, Cpu, Wrench, Globe, Sparkles } from "lucide-react";
import ContributionHeatmap from '../components/ContributionHeatmap/ContributionHeatmap';

const About = () => {
  const { t } = useTranslation();
  const skills = t('about.skills', { returnObjects: true }) || ['React', 'CSS', 'Accessibility'];

  const containerVariants = {
    hidden:  { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
  };

  const itemVariants = {
    hidden:  { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  return (
    <main data-comp="About" className="relative z-10 w-full overflow-hidden">
      <div className="mx-auto w-full px-6 sm:px-8 md:px-10 lg:px-12 pb-16 max-w-7xl">

        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 pt-16 flex flex-col gap-4 items-center"
        >
          <h1
            className="text-5xl md:text-7xl font-bold tracking-tight pb-1 mb-2"
            style={{ color: 'var(--color-text-primary)' }}
          >
            {t('about.titlePart1')}{' '}
            <span className="bg-linear-to-r from-[var(--color-accent)] to-[var(--color-accent-2)] bg-clip-text text-transparent">
              {t('about.titlePart2')}
            </span>
          </h1>
          <p className="text-lg md:text-xl max-w-2xl mx-auto italic font-medium" style={{ color: 'var(--color-text-muted)' }}>
            {t('about.subtitle')}
          </p>
        </motion.header>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 items-stretch"
        >
          {/* Card 1: DNA / Biography */}
          <motion.div variants={itemVariants} className="h-full" data-comp="DnaCard">
            <Card
              className="group relative h-full flex flex-col overflow-hidden backdrop-blur-xl border hover:border-white/10 transition-all duration-500 hover:-translate-y-1 shadow-lg hover:shadow-2xl hover:shadow-[var(--color-accent)]/10"
              style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border-subtle)' }}
            >
              <div className="absolute inset-0 bg-linear-to-br from-[var(--color-accent)]/10 to-[var(--color-accent-2)]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <Fingerprint className="absolute -left-6 -bottom-6 w-40 h-40 text-white/5 group-hover:text-white/10 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500" />

              <CardHeader className="px-6 pt-8 relative z-10 flex items-center gap-3">
                <div className="p-2.5 rounded-xl border" style={{ backgroundColor: 'color-mix(in srgb, var(--color-accent) 10%, transparent)', borderColor: 'color-mix(in srgb, var(--color-accent) 25%, transparent)' }}>
                  <Fingerprint className="w-6 h-6" style={{ color: 'var(--color-accent)' }} />
                </div>
                <h3 id="dna-title" className="text-2xl font-bold transition-colors group-hover:text-[var(--color-accent)]" style={{ color: 'var(--color-text-primary)' }}>
                  {t('about.dnaTitle')}
                </h3>
              </CardHeader>

              <CardBody className="px-6 pb-8 pt-4 relative z-10">
                <div
                  className="leading-relaxed text-sm md:text-base transition-colors group-hover:text-[var(--color-text-secondary)]"
                  style={{ color: 'var(--color-text-muted)' }}
                  dangerouslySetInnerHTML={{ __html: t('about.bioParagraph1') }}
                />
                <div
                  className="leading-relaxed text-sm md:text-base mt-4 transition-colors group-hover:text-[var(--color-text-secondary)]"
                  style={{ color: 'var(--color-text-muted)' }}
                  dangerouslySetInnerHTML={{ __html: t('about.bioParagraph2') }}
                />
              </CardBody>
            </Card>
          </motion.div>

          {/* Card 2: Competencies */}
          <motion.div variants={itemVariants} className="h-full" data-comp="CompetenciesCard">
            <Card
              className="group relative h-full flex flex-col overflow-hidden backdrop-blur-xl border hover:border-white/10 transition-all duration-500 hover:-translate-y-1 shadow-lg hover:shadow-2xl hover:shadow-[var(--color-accent-2)]/10"
              style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border-subtle)' }}
            >
              <div className="absolute inset-0 bg-linear-to-bl from-[var(--color-accent-2)]/10 to-[var(--color-accent)]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <Sparkles className="absolute -right-6 -bottom-6 w-40 h-40 text-white/5 group-hover:text-white/10 group-hover:scale-110 group-hover:-rotate-12 transition-all duration-500" />

              <CardHeader className="px-6 pt-8 relative z-10 flex items-center gap-3">
                <div className="p-2.5 rounded-xl border" style={{ backgroundColor: 'color-mix(in srgb, var(--color-accent-2) 10%, transparent)', borderColor: 'color-mix(in srgb, var(--color-accent-2) 25%, transparent)' }}>
                  <Sparkles className="w-6 h-6" style={{ color: 'var(--color-accent-2)' }} />
                </div>
                <h3 id="competencies-title" className="text-2xl font-bold transition-colors group-hover:text-[var(--color-accent-2)]" style={{ color: 'var(--color-text-primary)' }}>
                  {t('about.competenciesTitle')}
                </h3>
              </CardHeader>

              <CardBody className="px-6 pb-8 pt-4 relative z-10 flex flex-col">
                <ul className="space-y-6 flex-1" role="list" aria-labelledby="competencies-title">
                  {[
                    { Icon: Cpu,    key: 'ai',    hue: 'var(--color-accent)'   },
                    { Icon: Wrench, key: 'tools', hue: 'var(--color-accent-2)' },
                    { Icon: Globe,  key: 'intl',  hue: 'var(--color-accent)'   },
                  // eslint-disable-next-line no-unused-vars
                  ].map(({ Icon, key, hue }) => (
                    <li key={key} className="flex gap-4 items-start">
                      <div className="mt-1"><Icon className="w-5 h-5" style={{ color: hue }} /></div>
                      <div>
                        <h4 className="text-base font-semibold" style={{ color: 'var(--color-text-secondary)' }}>{t(`about.comp.${key}Title`)}</h4>
                        <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>{t(`about.comp.${key}Desc`)}</p>
                      </div>
                    </li>
                  ))}
                </ul>

                <div className="mt-8 pt-6 flex flex-wrap gap-2" style={{ borderTop: '1px solid var(--color-border-subtle)' }}>
                  {skills.map((skill) => (
                    <Chip
                      key={skill}
                      size="sm"
                      variant="flat"
                      className="border transition-all duration-300 px-3 py-4 group-hover:border-[var(--color-accent-2)]/30"
                      style={{
                        backgroundColor: 'var(--color-bg-surface)',
                        borderColor:     'var(--color-border-subtle)',
                        color:           'var(--color-text-secondary)',
                      }}
                    >
                      {skill}
                    </Chip>
                  ))}
                </div>
              </CardBody>
            </Card>
          </motion.div>
        </motion.div>

        {/* ── Contribution Heatmap ── */}
        <motion.div
          variants={itemVariants}
          data-comp="HeatmapPanel"
          className="mt-8 p-6 rounded-2xl border"
          style={{
            backgroundColor: 'var(--color-bg-card)',
            borderColor:     'var(--color-border-subtle)',
            backdropFilter:  'blur(12px)',
          }}
        >
          <ContributionHeatmap />
        </motion.div>
      </div>
    </main>
  );
};

export default About;
