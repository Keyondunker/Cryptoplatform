import React from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";

interface NavbarProps {
  theme: string;
  toggleTheme: () => void;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ theme, toggleTheme, onLogout }) => {
  return (
    <nav className={`navbar navbar-expand-lg ${theme === 'dark' ? 'navbar-dark bg-dark' : 'navbar-light bg-light'}`}>
      <div className="container-fluid">
        <Link className="navbar-brand fw-bold" to="/">
          CryptoAnalytics
        </Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/">Crypto Table</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/crypto-chart">Crypto Chart</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/predict">Predict Price</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/sentiment">Sentiment</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/anomalies">Anomaly</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/user-preferences">User Preferences</Link>
            </li>
          </ul>
          <div className="d-flex align-items-center">
            <button className="btn btn-outline-primary me-3" onClick={toggleTheme}>
              {theme === "light" ? "Dark Mode" : "Light Mode"}
            </button>
            <button className="btn btn-danger" onClick={onLogout}>Logout</button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
