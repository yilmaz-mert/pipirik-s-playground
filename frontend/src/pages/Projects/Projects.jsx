import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './Projects.css'; // Import the new CSS file

const Projects = () => {
  const location = useLocation();
  const { t } = useTranslation();
  
  // Determine if we are on the main projects listing page
  const isMainProjectsPage = location.pathname === '/projects';

  return (
    <div className="container page-wrapper">
      {isMainProjectsPage ? (
          <>
            <h1 className="hero-title">{t('projects.titlePart1')} <span>{t('projects.titlePart2')}</span></h1>
          
            {/* Using a CSS class instead of inline styles for better responsiveness */}
            <div className="project-grid">
            
              {/* Project: Hangman Game */}
              <Link to="hangman" className="project-card">
                <h3>{t('projects.hangman')}</h3>
                <p>{t('projects.hangmanDesc')}</p>
              </Link>
            
              {/* Project: Todo List */}
              <Link to="todolist" className="project-card">
                <h3>{t('projects.todolist')}</h3>
                <p>{t('projects.todolistDesc')}</p>
              </Link>

              {/* Project: Exam App */}
              <Link to="exam" className="project-card">
                <h3>{t('projects.exam')}</h3>
                <p>{t('projects.examDesc')}</p>
              </Link>

              <Link to="flight-tracker" className="project-card">
                <h3>{t('projects.flightTracker')}</h3>
                <p>{t('projects.flightTrackerDesc')}</p>
              </Link>
            
            </div>
          </>
      ) : (
        /* Render child routes (Hangman, TodoList, etc.) */
        <Outlet /> 
      )}
    </div>
  );
};

export default Projects;