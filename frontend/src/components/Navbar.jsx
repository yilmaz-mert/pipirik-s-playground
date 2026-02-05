import { NavLink } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Brand/Logo link leading to home */}
        <NavLink to="/" className="navbar-logo">
          Pipirik's <span>Playground</span>
        </NavLink>
        
        {/* Navigation menu items */}
        <div className="nav-links">
          {/* Using data-text attribute to pass the label to CSS.
              This helps the '::before' trick prevent text shifting.
          */}
          <NavLink to="/" className="nav-item" data-text="Home">Home</NavLink>
          <NavLink to="/about" className="nav-item" data-text="About">About</NavLink>
          <NavLink to="/projects" className="nav-item" data-text="Projects">Projects</NavLink>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;