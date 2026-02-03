import { NavLink } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <NavLink to="/" className="navbar-logo">
          Pipirik's <span>Playground</span>
        </NavLink>
        <div className="nav-links">
          <NavLink to="/" className="nav-item" data-text="Home">Home</NavLink>
          <NavLink to="/about" className="nav-item" data-text="About">About</NavLink>
          <NavLink to="/projects" className="nav-item" data-text="Projects">Projects</NavLink>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;