// src/pages/About.jsx
import React from 'react';
import './About.css';
import '../App.css';

const About = () => {
  return (
    <div className="home-wrapper">
      <div className="bg-animation">
        <div className="blob"></div>
        <div className="blob"></div>
      </div>

      <div className="about-container">
        <header className="about-header">
          <h1 className="about-title">Beyond the <span>Code</span></h1>
          <p className="hero-description">
            Electrical-Electronics Engineer & <span>Software Develoment</span> Enthusiast.
          </p>
        </header>

        <div className="about-grid">
          {/* Main Story Card */}
          <div className="about-card">
            <h3>My Engineering DNA</h3>
            <p className="about-text">
              I am an <strong>Electrical-Electronics Engineer</strong>  
              who believes that software is the most powerful tool for solving modern engineering 
              challenges. My background isn't just limited to code; I am passionate 
              about <strong>metalworking, welding,</strong> and <strong>3D printing</strong>.
            </p>
            <p className="about-text" style={{ marginTop: '1rem' }}>
              From developing real-time <strong>Facial Recognition</strong> systems on Raspberry Pi 
              to optimizing <strong>Machine Learning</strong> models like LightGBM, I focus 
              on building practical, data-driven solutions.
            </p>
          </div>

          {/* Technical Specs Card */}
          <div className="about-card">
            <h3>Core Competencies</h3>
            
            <div className="experience-item">
              <h4>AI & Data Science</h4>
              <span>Python, ML, Computer Vision</span>
            </div>

            <div className="experience-item">
              <h4>Engineering Tools</h4>
              <span>3D Modeling (CATIA, Solidworks), SQL, Git</span>
            </div>

            <div className="experience-item">
              <h4>International Experience</h4>
              <span>Work and Travel (TN, USA) - English Proficiency</span>
            </div>

            <div className="skill-tag-group" style={{ marginTop: '1.5rem' }}>
              <span className="skill-badge-pro">Python</span>
              <span className="skill-badge-pro">PyTorch</span>
              <span className="skill-badge-pro">LightGBM</span>
              <span className="skill-badge-pro">Raspberry Pi</span>
              <span className="skill-badge-pro">React</span>
              <span className="skill-badge-pro">YOLO</span>
              <span className="skill-badge-pro">OpenCV</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;