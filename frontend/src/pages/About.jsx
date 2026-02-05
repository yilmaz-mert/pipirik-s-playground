// src/pages/About.jsx
import React from 'react';
import './About.css';
import '../App.css';

const About = () => {
  return (
    <main className="home-wrapper">
      {/* Background animations with optimized blobs */}
      <div className="bg-animation" aria-hidden="true">
        <div className="blob"></div>
        <div className="blob"></div>
      </div>

      <div className="about-container">
        <header className="about-header">
          <h1 className="about-title">Beyond the <span>Code</span></h1>
          <p className="hero-description">
            Electrical-Electronics Engineer & <span>Software Development</span> Enthusiast.
          </p>
        </header>

        <div className="about-grid">
          {/* Main Story Card */}
          <section className="about-card" aria-labelledby="dna-title">
            <h3 id="dna-title">My Engineering DNA</h3>
            <p className="about-text">
              I am an <strong>Electrical-Electronics Engineer</strong>  
              who believes that software is the most powerful tool for solving modern engineering 
              challenges. My background isn't just limited to code; I am passionate 
              about <strong>metalworking, welding,</strong> and <strong>3D printing</strong>.
            </p>
            <p className="about-text about-text-secondary">
              From developing real-time <strong>Facial Recognition</strong> systems on Raspberry Pi 
              to optimizing <strong>Machine Learning</strong> models like LightGBM, I focus 
              on building practical, data-driven solutions.
            </p>
          </section>

          {/* Technical Specs Card */}
          <section className="about-card" aria-labelledby="competencies-title">
            <h3 id="competencies-title">Core Competencies</h3>
            
            <ul className="experience-list" role="list">
              <li className="experience-item">
                <h4>AI & Data Science</h4>
                <p>Python, ML, Computer Vision</p>
              </li>

              <li className="experience-item">
                <h4>Engineering Tools</h4>
                <p>3D Modeling (CATIA, Solidworks), SQL, Git</p>
              </li>

              <li className="experience-item">
                <h4>International Experience</h4>
                <p>Work and Travel (TN, USA) - English Proficiency</p>
              </li>
            </ul>

            <div className="skill-tag-group">
              {["Python", "PyTorch", "LightGBM", "Raspberry Pi", "React", "YOLO", "OpenCV"].map((skill) => (
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