import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import CryptoTable from "./components/CryptoTable";
import CryptoChart from "./components/CryptoChart";
import SearchBar from "./components/SearchBar";
import UserPreference from "./components/UserPreferences";
import PredictPage from "./components/PredictionPanel";
import Login from "./components/Login";
import Navbar from "./components/Navbar";  // Import the Navbar component
import "./App.css";
import { getAccessToken, logout } from "./auth/authService";

const App: React.FC = () => {
  const [theme, setTheme] = useState<string>(localStorage.getItem("theme") || "light");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!getAccessToken());

  // Toggle light/dark mode
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
  };

  const handleCryptoSelect = (symbol: string) => {
    setSelectedSymbol(symbol);
    console.log("Selected Cryptocurrency:", symbol);
  };

  const handleLogout = () => {
    logout();
    setIsAuthenticated(false);
    window.location.href = "/login";
  };

  useEffect(() => {
    document.body.className = theme; // Apply theme dynamically
  }, [theme]);

  return (
    <Router>
      <div className={`app-container ${theme}`}>
        {isAuthenticated ? (
          <>
            {/* Navbar Component */}
            <Navbar theme={theme} toggleTheme={toggleTheme} onLogout={handleLogout} />

            {/* Search Bar Component */}
            <div className="container mt-3">
              <SearchBar searchTerm={searchTerm} onSearch={handleSearchChange} />
            </div>

            <div className="container mt-4">
              <Routes>
                <Route
                  path="/"
                  element={
                    <CryptoTable searchTerm={searchTerm} onSelect={handleCryptoSelect} />
                  }
                />
                <Route
                  path="/crypto-chart"
                  element={
                    selectedSymbol ? (
                      <CryptoChart symbol={selectedSymbol} />
                    ) : (
                      <div>Please select a cryptocurrency from the table.</div>
                    )
                  }
                />
                <Route path="/predict" element={<PredictPage />} />
                <Route path="/user-preferences" element={<UserPreference />} />
              </Routes>
            </div>
          </>
        ) : (
          <Routes>
            <Route path="/login" element={<Login onLoginSuccess={() => setIsAuthenticated(true)} />} />
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        )}
      </div>
    </Router>
  );
};

export default App;
