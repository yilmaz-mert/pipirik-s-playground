// src/App.jsx
import React, { lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';

// Sayfaları Lazy Loading ile asenkron hale getiriyoruz
// Bu sayede kullanıcı hangi sayfaya girerse sadece o sayfanın kodu yüklenir
const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const Projects = lazy(() => import('./pages/Projects/Projects'));
const Hangman = lazy(() => import('./pages/Projects/Hangman/Hangman'));
const TodoList = lazy(() => import('./pages/Projects/TodoList/TodoList'));
const Exam = lazy(() => import('./pages/Projects/Exam/Exam'));
const FlightTracker = lazy(() => import('./pages/Projects/FlightTracker/FlightTracker'));

function App() {
  return (
    <Router>
      {/* Navbar her zaman görünür olacak */}
      <Navbar />

      {/* Global arka plan animasyonu */}
      <div className="bg-animation"> 
        <div className="blob"></div>
        <div className="blob"></div>
      </div>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        
        {/* Projects Layout ve Alt Rotalar */}
        <Route path="/projects" element={<Projects />}>
          <Route path="hangman" element={<Hangman />} />
          <Route path="todolist" element={<TodoList />} />
          <Route path="exam" element={<Exam />} /> {/* /projects/exam şeklindeki hata düzeltildi */}
          <Route path="flight-tracker" element={<FlightTracker />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;