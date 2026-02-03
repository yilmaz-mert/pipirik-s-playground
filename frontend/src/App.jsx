// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import About from './pages/About';
import Hangman from './pages/Projects/Hangman/Hangman';
import TodoList from './pages/Projects/TodoList/TodoList'; 
import Projects from './pages/Projects/Projects';
import './App.css';

function App() {
  return (
    <Router>
      <Navbar />
      <div className="bg-animation"> {/* Animasyon burada tek bir yerde dursun */}
        <div className="blob"></div>
        <div className="blob"></div>
        <div className="blob"></div>
      </div>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/projects" element={<Projects />} />
        
        {/* Projeler Nested Route Yapısı */}
        <Route path="/projects" element={<Projects />}>
          <Route path="hangman" element={<Hangman />} />
          <Route path="todolist" element={<TodoList />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;