// src/App.jsx
import React, { lazy, Suspense, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import FloatingDock   from './components/FloatingDock/FloatingDock';
import ThemeAssetLoader from './context/ThemeAssetLoader';
import EngineerHUD    from './components/EngineerHUD/EngineerHUD';
import CommandPalette from './components/CommandPalette/CommandPalette';
import MatrixRain     from './components/MatrixRain/MatrixRain';
import { useBrowserState } from './hooks/useBrowserState';

// Route-level code splitting — each chunk loads only when first visited
const Home          = lazy(() => import('./pages/Home/Home'));
const About         = lazy(() => import('./pages/About'));
const Projects      = lazy(() => import('./pages/Projects/Projects'));
const Hangman       = lazy(() => import('./pages/Projects/Hangman/Hangman'));
const TodoList      = lazy(() => import('./pages/Projects/TodoList/TodoList'));
const Exam          = lazy(() => import('./pages/Projects/Exam/Exam'));
const FlightTracker = lazy(() => import('./pages/Projects/FlightTracker/FlightTracker'));

// ── Inner app — uses hooks that require Router context ────────────────────────
function AppInner() {
  const [matrixActive, setMatrixActive] = useState(false);

  // Keep tab title and favicon in sync with active theme
  useBrowserState();

  return (
    <>
      {/* CSS blob background */}
      <div className="bg-animation">
        <div className="blob" />
        <div className="blob" />
      </div>

      {/* Phase THREE — lazy theme asset injection */}
      <Suspense fallback={null}>
        <ThemeAssetLoader />
      </Suspense>

      {/* ── Global OS-layer UI ── */}
      <EngineerHUD />
      <CommandPalette onMatrixRain={() => setMatrixActive(true)} />

      {/* Matrix rain Easter egg — unmounts itself via AnimatePresence after fade */}
      <AnimatePresence>
        {matrixActive && (
          <MatrixRain key="matrix" onDone={() => setMatrixActive(false)} />
        )}
      </AnimatePresence>

      {/* ── Page routes ── */}
      <Routes>
        <Route path="/"        element={<Home />} />
        <Route path="/about"   element={<About />} />
        <Route path="/projects" element={<Projects />}>
          <Route path="hangman"        element={<Hangman />} />
          <Route path="todolist"       element={<TodoList />} />
          <Route path="exam"           element={<Exam />} />
          <Route path="flight-tracker" element={<FlightTracker />} />
        </Route>
      </Routes>

      {/* Floating Dock — always on top */}
      <FloatingDock />
    </>
  );
}

function App() {
  return (
    <Router>
      <AppInner />
    </Router>
  );
}

export default App;
