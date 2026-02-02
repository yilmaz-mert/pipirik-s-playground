import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";

function MainLayout() {
  return (
    <div className="portfolio-container">
      <Navbar /> {/* Top Bar her zaman en üstte */}
      <main className="content">
        <Outlet /> {/* Rotalardaki sayfalar tam buraya yerleşir */}
      </main>
    </div>
  );
}

export default MainLayout;