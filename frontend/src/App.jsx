// src/App.jsx
import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import ThemeAssetLoader from './context/ThemeAssetLoader';

// Route-level code splitting — each page loads only when first visited
const Home        = lazy(() => import('./pages/Home/Home'));
const About       = lazy(() => import('./pages/About'));
const Projects    = lazy(() => import('./pages/Projects/Projects'));
const Hangman     = lazy(() => import('./pages/Projects/Hangman/Hangman'));
const TodoList    = lazy(() => import('./pages/Projects/TodoList/TodoList'));
const Exam        = lazy(() => import('./pages/Projects/Exam/Exam'));
const FlightTracker = lazy(() => import('./pages/Projects/FlightTracker/FlightTracker'));

function App() {
  return (
    <Router>
      <Navbar />

      {/* CSS blob background (modern-dark skin) */}
      <div className="bg-animation">
        <div className="blob" />
        <div className="blob" />
      </div>

      {/*
        Phase THREE — Theme Asset Injection Point
        ThemeAssetLoader inspects the active theme and, if that theme ships
        heavy assets (Three.js, WebGPU, etc.), lazily mounts them here.
        The fallback is null so the page stays visible while the chunk loads.
        "modern-dark" has no heavy assets, so this renders nothing for now.
      */}
      <Suspense fallback={null}>
        <ThemeAssetLoader />
      </Suspense>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />

        {/* Projects shell + nested mini-app routes (DO NOT touch the mini-apps) */}
        <Route path="/projects" element={<Projects />}>
          <Route path="hangman"        element={<Hangman />} />
          <Route path="todolist"       element={<TodoList />} />
          <Route path="exam"           element={<Exam />} />
          <Route path="flight-tracker" element={<FlightTracker />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
