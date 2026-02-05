import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import './Projects.css'; // Import the new CSS file

const Projects = () => {
  const location = useLocation();
  
  // Determine if we are on the main projects listing page
  const isMainProjectsPage = location.pathname === '/projects';

  return (
    <div className="container">
      {isMainProjectsPage ? (
        <>
          <h1 className="hero-title">My <span>Projects</span></h1>
          
          {/* Using a CSS class instead of inline styles for better responsiveness */}
          <div className="project-grid">
            
            {/* Project: Hangman Game */}
            <Link to="hangman" className="project-card">
              <h3>Hangman Game</h3>
              <p>Test your vocabulary!</p>
            </Link>
            
            {/* Project: Todo List */}
            <Link to="todolist" className="project-card">
              <h3>Todo List</h3>
              <p>Manage your daily tasks.</p>
            </Link>

            {/* Project: Exam App */}
            <Link to="exam" className="project-card">
              <h3>Exam</h3>
              <p>Test your knowledge!</p>
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