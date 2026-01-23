import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import TodoList from "./pages/TodoList/TodoList";
import Hangman from "./pages/Hangman/Hangman";
import "./App.css";

function App() {
  return (
    <Router>
      <nav className="navbar">
        <Link to="/" className="nav-link">📝 To-Do List</Link>
        <Link to="/hangman" className="nav-link">🎮 Adam Asmaca</Link>
      </nav>

      <Routes>
        <Route path="/" element={<TodoList />} />
        <Route path="/hangman" element={<Hangman />} />
      </Routes>
    </Router>
  );
}

export default App;