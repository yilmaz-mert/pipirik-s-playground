// src/pages/About.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardHeader, CardBody, Chip } from '@heroui/react';

const About = () => {
  const { t } = useTranslation();
  const skills = t('about.skills', { returnObjects: true }) || ['React', 'CSS', 'Accessibility'];

  return (
    <main className="home-wrapper page-wrapper">
      <div className="bg-animation">
        <div className="blob" />
        <div className="blob" />
      </div>

      <div
        className="mx-auto w-full px-6 sm:px-8 md:px-10 lg:px-12 pb-16 max-w-[1100px]"

      >
        <header className="text-center mb-12 pt-16 flex flex-col gap-6 items-center">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-[#F8FAFC] mb-4 pb-1">
            {t('about.titlePart1')}{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#38BDF8] to-[#818CF8]">
              {t('about.titlePart2')}
            </span>
          </h1>
          <p className="text-[color:var(--muted)] text-xl max-w-2xl mx-auto italic">{t('about.subtitle')}</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 items-stretch">
          <Card className="col-span-1 md:col-span-1 bg-[var(--card-bg)] border-[1px] border-[var(--card-border)]">
            <CardHeader className="px-6 pt-6">
              <h3 id="dna-title" className="text-xl font-bold text-[color:var(--accent)]">
                {t('about.dnaTitle')}
              </h3>
            </CardHeader>
            <CardBody className="px-6 pb-6">
              <div className="text-[color:var(--muted)] leading-relaxed text-sm" dangerouslySetInnerHTML={{ __html: t('about.bioParagraph1') }} />
              <div className="text-[color:var(--muted)] leading-relaxed text-sm mt-4" dangerouslySetInnerHTML={{ __html: t('about.bioParagraph2') }} />
            </CardBody>
          </Card>

          <Card className="col-span-1 md:col-span-1 bg-[var(--card-bg)] border-[1px] border-[var(--card-border)]">
            <CardHeader className="px-6 pt-6">
              <h3 id="competencies-title" className="text-lg font-semibold text-white">{t('about.competenciesTitle')}</h3>
            </CardHeader>
            <CardBody className="px-6 pb-6">
              <ul className="space-y-4" role="list" aria-labelledby="competencies-title">
                <li>
                  <h4 className="text-sm font-semibold text-white">{t('about.comp.aiTitle')}</h4>
                  <p className="text-[color:var(--muted)] text-sm">{t('about.comp.aiDesc')}</p>
                </li>
                <li>
                  <h4 className="text-sm font-semibold text-white">{t('about.comp.toolsTitle')}</h4>
                  <p className="text-[color:var(--muted)] text-sm">{t('about.comp.toolsDesc')}</p>
                </li>
                <li>
                  <h4 className="text-sm font-semibold text-white">{t('about.comp.intlTitle')}</h4>
                  <p className="text-[color:var(--muted)] text-sm">{t('about.comp.intlDesc')}</p>
                </li>
              </ul>

              <div className="mt-6 flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <Chip
                    key={skill}
                    size="sm"
                    variant="flat"
                    className="text-xs font-medium"
                    style={{
                      background: 'color-mix(in srgb, var(--accent) 8%, transparent)',
                      color: 'var(--accent)',
                      border: '1px solid rgba(255,255,255,0.04)',
                      padding: '0.25rem 0.6rem',
                      borderRadius: '0.5rem'
                    }}
                    onMouseDown={(e) => e.preventDefault()}
                  >
                    {skill}
                  </Chip>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </main>
  );
};

export default About;