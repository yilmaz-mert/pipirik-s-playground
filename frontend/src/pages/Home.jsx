// src/pages/Home.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { FaGithub, FaLinkedin } from 'react-icons/fa'; 
// Note: If bundle size is an issue, consider importing only the specific icons
// to reduce the "Unused JavaScript" score significantly.
import mertProfile from "../assets/mert-profile.webp";
import './Home.css';

const Home = () => {
  const { t } = useTranslation();

  return (
    <main className="home-wrapper page-wrapper">
      <div className="home-container">
        <section className="hero-content" aria-label="Introduction">
          <div className="profile-aside">
            <div className="profile-frame">
              <img 
                src={mertProfile} 
                alt="Mert's Professional Profile" 
                fetchpriority="high" // Critical for fixing the 18s LCP
                loading="eager"      // Forces immediate download
                width="280"          // Prevents Layout Shift (CLS)
                height="280"
                className="hero-image"
              />
            </div>
            <nav className="social-links" aria-label="Social Media Links">
              <a 
                href="https://github.com/yilmaz-mert" 
                target="_blank" 
                rel="noopener noreferrer" // Security best practice for target="_blank"
                aria-label="Visit Mert's GitHub Profile"
              >
                <FaGithub />
              </a>
              <a 
                href="https://www.linkedin.com/in/yilmaz-mert/" 
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label="Visit Mert's LinkedIn Profile"
              >
                <FaLinkedin />
              </a>
            </nav>
          </div>

          <div className="text-aside">
            <header>
              <h1 className="hero-title">{t('home.heroTitle', { name: 'Mert' })}</h1>
              <h2 className="hero-subtitle">{t('home.heroSubtitle')}</h2>
            </header>
            
            <p className="hero-description">
              {t('home.specializedPrefix')} <strong>{t('home.skill1')}</strong> and <strong>{t('home.skill2')}</strong>. 
              Bridging the gap between engineering and modern web technologies.
            </p>

            <div className="skill-tags" role="list">
              {t('home.skills', { returnObjects: true }).map((s) => (
                <span key={s} role="listitem">{s}</span>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};

export default Home;