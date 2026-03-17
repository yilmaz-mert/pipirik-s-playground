// src/App.jsx
import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import FloatingDock from './components/FloatingDock/FloatingDock';
import ThemeAssetLoader from './context/ThemeAssetLoader';

// Route-level code splitting — each chunk loads only when first visited
const Home          = lazy(() => import('./pages/Home/Home'));
const About         = lazy(() => import('./pages/About'));
const Projects      = lazy(() => import('./pages/Projects/Projects'));
const Hangman       = lazy(() => import('./pages/Projects/Hangman/Hangman'));
const TodoList      = lazy(() => import('./pages/Projects/TodoList/TodoList'));
const Exam          = lazy(() => import('./pages/Projects/Exam/Exam'));
const FlightTracker = lazy(() => import('./pages/Projects/FlightTracker/FlightTracker'));

function App() {
  return (
    <Router>
      {/* CSS blob background — Cyber-Naturalism lavender blobs */}
      <div className="bg-animation">
        <div className="blob" />
        <div className="blob" />
      </div>

      {/* Phase THREE — lazy theme asset injection (Three.js / WebGPU per skin) */}
      <Suspense fallback={null}>
        <ThemeAssetLoader />
      </Suspense>

      <Routes>
        <Route path="/"        element={<Home />} />
        <Route path="/about"   element={<About />} />

        {/* Projects shell + nested mini-app routes — DO NOT touch sub-pages */}
        <Route path="/projects" element={<Projects />}>
          <Route path="hangman"        element={<Hangman />} />
          <Route path="todolist"       element={<TodoList />} />
          <Route path="exam"           element={<Exam />} />
          <Route path="flight-tracker" element={<FlightTracker />} />
        </Route>
      </Routes>

      {/* Floating Dock — always rendered on top of all page content */}
      <FloatingDock />
    </Router>
  );
}

export default App;
