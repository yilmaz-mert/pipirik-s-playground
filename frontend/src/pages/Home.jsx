// src/pages/Home.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { FaGithub, FaLinkedin } from 'react-icons/fa'; // npm install react-icons
import mertProfile from "../assets/mert-profile.png";
import './Home.css';

const Home = () => {
  return (
    <div className="home-wrapper">
      <div className="home-container">
        <section className="hero-content">
          <div className="profile-aside">
            <div className="profile-frame">
              <img src={mertProfile} alt="Mert Profile" />
            </div>
            <div className="social-links">
              <a href="https://github.com/yilmaz-mert" target="_blank" rel="noreferrer"><FaGithub /></a>
              <a href="https://www.linkedin.com/in/yilmaz-mert/" target="_blank" rel="noreferrer"><FaLinkedin /></a>
            </div>
          </div>

          <div className="text-aside">
            <h1 className="hero-title">Hi, I'm <span>Mert</span></h1>
            <h2 className="hero-subtitle">Electrical-Electronics Engineer</h2>
            <p className="hero-description">
              Specialized in <strong>Machine Learning</strong> and <strong>Computer Vision</strong>. 
              Bridging the gap between engineering and modern web technologies.
            </p>

            <div className="skill-tags">
              <span>Web Development</span>
              <span>Machine Learning</span>
              <span>Data Science</span>
              <span>Computer Vision</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;