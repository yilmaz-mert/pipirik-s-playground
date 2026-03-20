// src/App.jsx
import React, { lazy, Suspense, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import FloatingDock    from './components/FloatingDock/FloatingDock';
import ThemeAssetLoader from './context/ThemeAssetLoader';
import EngineerHUD     from './components/EngineerHUD/EngineerHUD';
import CommandPalette  from './components/CommandPalette/CommandPalette';
import MatrixRain      from './components/MatrixRain/MatrixRain';
import SunsetDecoder   from './components/SunsetDecoder/SunsetDecoder';
import { useBrowserState }    from './hooks/useBrowserState';
import { useTheme }           from './context/ThemeContext';
import { useLocation }        from 'react-router-dom';

// Route-level code splitting — each chunk loads only when first visited
const Home          = lazy(() => import('./pages/Home/Home'));
const About         = lazy(() => import('./pages/About'));
const Projects      = lazy(() => import('./pages/Projects/Projects'));
const Hangman       = lazy(() => import('./pages/Projects/Hangman/Hangman'));
const TodoList      = lazy(() => import('./pages/Projects/TodoList/TodoList'));
const Exam          = lazy(() => import('./pages/Projects/Exam/Exam'));
const FlightTracker = lazy(() => import('./pages/Projects/FlightTracker/FlightTracker'));

// ── CRT page transition variants ─────────────────────────────────────────────
// Mimics an old CRT monitor flicker: slight brightness surge + micro-blur
// on exit, then a clean snap-in on enter. Duration ≤ 120ms keeps it snappy.
const crtExit = {
  opacity:   0,
  filter:    'brightness(2.5) blur(3px) hue-rotate(20deg)',
  transition: { duration: 0.1, ease: 'easeIn' },
};
const crtEnter = {
  opacity:   0,
  filter:    'brightness(0.4) blur(2px) hue-rotate(-10deg)',
};
const crtVisible = {
  opacity:   1,
  filter:    'brightness(1) blur(0px) hue-rotate(0deg)',
  transition: { duration: 0.18, ease: [0.22, 1, 0.36, 1] },
};

// ── Inner app — uses hooks that require Router context ────────────────────────
function AppInner() {
  const [matrixActive, setMatrixActive] = useState(false);
  const { theme }    = useTheme();
  const { pathname } = useLocation();

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

      {/* Sunset Glass "X-Ray" decoder layer — Home page only */}
      {theme === 'sunset-glass' && pathname === '/' && <SunsetDecoder />}

      {/* ── Global OS-layer UI ── */}
      <EngineerHUD />
      <CommandPalette onMatrixRain={() => setMatrixActive(true)} />

      {/* Matrix rain Easter egg — unmounts itself via AnimatePresence after fade */}
      <AnimatePresence>
        {matrixActive && (
          <MatrixRain key="matrix" onDone={() => setMatrixActive(false)} />
        )}
      </AnimatePresence>

      {/* ── Page routes — wrapped in AnimatePresence for CRT transitions ── */}
      {/* routeKey on the top-level segment so sub-routes (projects/*) don't re-trigger */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={pathname.split('/')[1] || 'home'}
          initial={crtEnter}
          animate={crtVisible}
          exit={crtExit}
          style={{ width: '100%' }}
        >
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
        </motion.div>
      </AnimatePresence>

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
