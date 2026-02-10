// src/pages/About.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import './About.css';
import '../App.css';

const About = () => {
  const { t } = useTranslation();

  return (
    <main className="home-wrapper page-wrapper">
      {/* Background animations with optimized blobs */}
      <div className="bg-animation" aria-hidden="true">
        <div className="blob"></div>
        <div className="blob"></div>
      </div>

      <div className="about-container">
        <header className="about-header">
          <h1 className="about-title">{t('about.titlePart1')} <span>{t('about.titlePart2')}</span></h1>
          <p className="hero-description">
            {t('about.subtitle')}
          </p>
        </header>

        <div className="about-grid">
          {/* Main Story Card */}
          <section className="about-card" aria-labelledby="dna-title">
            <h3 id="dna-title">{t('about.dnaTitle')}</h3>
            <p className="about-text" dangerouslySetInnerHTML={{ __html: t('about.bioParagraph1') }} />
            <p className="about-text about-text-secondary" dangerouslySetInnerHTML={{ __html: t('about.bioParagraph2') }} />
          </section>

          {/* Technical Specs Card */}
          <section className="about-card" aria-labelledby="competencies-title">
            <h3 id="competencies-title">{t('about.competenciesTitle')}</h3>

            <ul className="experience-list" role="list">
              <li className="experience-item">
                <h4>{t('about.comp.aiTitle')}</h4>
                <p>{t('about.comp.aiDesc')}</p>
              </li>

              <li className="experience-item">
                <h4>{t('about.comp.toolsTitle')}</h4>
                <p>{t('about.comp.toolsDesc')}</p>
              </li>

              <li className="experience-item">
                <h4>{t('about.comp.intlTitle')}</h4>
                <p>{t('about.comp.intlDesc')}</p>
              </li>
            </ul>

            <div className="skill-tag-group">
              {t('about.skills', { returnObjects: true }).map((skill) => (
                <span key={skill} className="skill-badge-pro">{skill}</span>
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
};

export default About;