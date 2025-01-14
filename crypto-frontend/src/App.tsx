import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import CryptoTable from "./components/CryptoTable"; // CryptoTable component
import CryptoChart from "./components/CryptoChart"; // CryptoChart component
import UserPreference from "./components/UserPreferences"; // UserPreference page
import SearchBar from "./components/SearchBar"; // SearchBar component
import PredictPage from "./components/PredictionPanel";
import "./App.css"; // Global styles (optional)

const App: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState(""); // State to track the search term
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null); // State for selected cryptocurrency

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
  };

  const handleCryptoSelect = (symbol: string) => {
    setSelectedSymbol(symbol);
    console.log("Selected Cryptocurrency:", symbol); // Logs the selected cryptocurrency for debugging
  };

  return (
    <Router>
      <div>
        {/* Navigation Bar */}
        <nav className="navbar navbar-expand-lg navbar-light bg-light">
          <div className="container-fluid">
            <Link className="navbar-brand" to="/">
              CryptoAnalytics
            </Link>
            <div className="collapse navbar-collapse" id="navbarNav">
              <ul className="navbar-nav">
                <li className="nav-item">
                  <Link className="nav-link" to="/">
                    Crypto Table
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/crypto-chart">
                    Crypto Chart
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/predict">
                    Predict Price
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/user-preferences">
                    User Preferences
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </nav>

        {/* Search Bar */}
        <div className="container mt-3">
          <SearchBar searchTerm={searchTerm} onSearch={handleSearchChange} />
        </div>

        {/* Routes */}
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
            <Route path="/predict" element={<PredictPage />} /> {/* Add the route */}
            <Route path="/user-preferences" element={<UserPreference />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;
