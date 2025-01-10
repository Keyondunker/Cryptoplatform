import React from "react";

interface SearchBarProps {
  searchTerm: string; // The current search term
  onSearch: (value: string) => void; // Function to handle search input changes
}

const SearchBar: React.FC<SearchBarProps> = ({ searchTerm, onSearch }) => {
  return (
    <div className="search-bar mb-3">
      <input
        type="text"
        className="form-control"
        placeholder="Search by name or symbol..."
        value={searchTerm}
        onChange={(e) => onSearch(e.target.value)} // Trigger onSearch when input changes
      />
    </div>
  );
};

export default SearchBar;
