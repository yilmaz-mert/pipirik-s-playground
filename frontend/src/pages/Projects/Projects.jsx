import React from 'react';

import { Link, Outlet, useLocation } from 'react-router-dom';

const Projects = () => {
  const location = useLocation();
  const isMainProjectsPage = location.pathname === '/projects';

  return (
    <div className="container">
      {isMainProjectsPage ? (
        <>
          <h1>My Projects</h1>
          <div className="project-grid" style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
            <Link to="hangman" className="project-card">
              <h3>Hangman Game</h3>
              <p>Test your vocabulary!</p>
            </Link>
            <Link to="todolist" className="project-card">
              <h3>Todo List</h3>
              <p>Manage your daily tasks.</p>
            </Link>
          </div>
        </>
      ) : (
        <Outlet /> /* Burası Hangman veya TodoList içeriğini basar */
      )}
    </div>
  );
};

export default Projects;