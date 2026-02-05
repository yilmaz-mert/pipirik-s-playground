// src/pages/Home.jsx
import React from 'react';
import { FaGithub, FaLinkedin } from 'react-icons/fa'; 
// Note: If bundle size is an issue, consider importing only the specific icons
// to reduce the "Unused JavaScript" score significantly.
import mertProfile from "../assets/mert-profile.webp";
import './Home.css';

const Home = () => {
  return (
    <main className="home-wrapper">
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
              <h1 className="hero-title">Hi, I'm <span>Mert</span></h1>
              <h2 className="hero-subtitle">Electrical-Electronics Engineer</h2>
            </header>
            
            <p className="hero-description">
              Specialized in <strong>Machine Learning</strong> and <strong>Computer Vision</strong>. 
              Bridging the gap between engineering and modern web technologies.
            </p>

            <div className="skill-tags" role="list">
              <span role="listitem">Web Development</span>
              <span role="listitem">Machine Learning</span>
              <span role="listitem">Data Science</span>
              <span role="listitem">Computer Vision</span>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};

export default Home;