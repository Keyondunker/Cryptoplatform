import React from "react";
import { FaSearch } from "react-icons/fa";
import "./SearchBar.css"; // Importing the updated CSS file

interface SearchBarProps {
  searchTerm: string;
  onSearch: (value: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ searchTerm, onSearch }) => {
  return (
    <div className="search-bar-container">
      <div className="search-bar">
        <input
          type="text"
          className="search-input"
          placeholder="Search cryptocurrencies..."
          value={searchTerm}
          onChange={(e) => onSearch(e.target.value)}
          aria-label="Search cryptocurrencies"
        />
        <button className="search-btn" aria-label="Search">
          <FaSearch />
        </button>
      </div>
    </div>
  );
};

export default SearchBar;
