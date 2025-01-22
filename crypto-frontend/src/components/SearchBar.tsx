import React from "react";
import { FaSearch } from "react-icons/fa";

interface SearchBarProps {
  searchTerm: string; // The current search term
  onSearch: (value: string) => void; // Function to handle search input changes
}

const SearchBar: React.FC<SearchBarProps> = ({ searchTerm, onSearch }) => {
  return (
    <div className="search-bar-container">
      <div className="search-bar">
        <input
          type="text"
          className="form-control search-input"
          placeholder="Search cryptocurrencies by name or symbol..."
          value={searchTerm}
          onChange={(e) => onSearch(e.target.value)} // Trigger onSearch when input changes
        />
        <button className="search-btn">
          <FaSearch />
        </button>
      </div>
    </div>
  );
};

export default SearchBar;
