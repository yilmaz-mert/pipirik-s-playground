import React from 'react';
/* Import routing components from react-router-dom */
import { Link, Outlet, useLocation } from 'react-router-dom';

const Projects = () => {
  /* Get the current location object to determine the active path */
  const location = useLocation();
  
  /* Check if the user is on the root projects page or a sub-route */
  const isMainProjectsPage = location.pathname === '/projects';

  return (
    <div className="container">
      {/* Conditional Rendering based on the current URL path */}
      {isMainProjectsPage ? (
        <>
          <h1 className="hero-title">My <span>Projects</span></h1>
          
          {/* Grid layout containing links to individual project sub-routes */}
          <div className="project-grid" style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
            
            {/* Link to the Hangman game sub-route */}
            <Link to="hangman" className="project-card">
              <h3>Hangman Game</h3>
              <p>Test your vocabulary!</p>
            </Link>
            
            {/* Link to the Todo List application sub-route */}
            <Link to="todolist" className="project-card">
              <h3>Todo List</h3>
              <p>Manage your daily tasks.</p>
            </Link>

            {/* Link to the Exam application sub-route */}
            <Link to="exam" className="project-card">
              <h3>Exam</h3>
              <p>Test your knowledge!</p>
            </Link>
            
          </div>
        </>
      ) : (
        /* The Outlet component acts as a placeholder. 
           It renders the child component (Hangman or TodoList) 
           matching the current sub-route. 
        */
        <Outlet /> 
      )}
    </div>
  );
};

export default Projects;