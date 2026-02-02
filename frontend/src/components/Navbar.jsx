import { Link, NavLink } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  return (
    <nav className="navbar">
      <Link to="/" className="nav-logo">Portfolio</Link>
      <ul className="nav-menu">
        <li><NavLink to="/">Ana Sayfa</NavLink></li>
        <li><NavLink to="/hakkimda">Hakkımda</NavLink></li>
        <li><NavLink to="/projeler">Projeler</NavLink></li>
        <li><NavLink to="/iletisim">İletişim</NavLink></li>
      </ul>
    </nav>
  );
}

export default Navbar;