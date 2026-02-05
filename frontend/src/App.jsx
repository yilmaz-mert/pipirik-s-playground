// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import About from './pages/About';
import Hangman from './pages/Projects/Hangman/Hangman';
import TodoList from './pages/Projects/TodoList/TodoList'; 
import Exam from "./pages/Projects/Exam/Exam";
import Projects from './pages/Projects/Projects';
import './App.css';

function App() {
  return (
    <Router>
      {/* Navbar is persistent across all pages */}
      <Navbar />

      {/* Global background animation stays here to avoid re-mounting on route change */}
      <div className="bg-animation"> 
        <div className="blob"></div>
        <div className="blob"></div>
        <div className="blob"></div>
      </div>

      <Routes>
        {/* Main Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        
        {/* Nested Route Structure for Projects.
            This allows 'Projects' to act as a layout for its children.
        */}
        <Route path="/projects" element={<Projects />}>
          {/* Sub-routes: accessible via /projects/hangman and /projects/todolist */}
          <Route path="hangman" element={<Hangman />} />
          <Route path="todolist" element={<TodoList />} />
          <Route path="/projects/exam" element={<Exam />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;