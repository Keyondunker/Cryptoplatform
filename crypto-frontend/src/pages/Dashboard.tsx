import React, { useState } from "react";
import CryptoTable from "../components/CryptoTable";
import SearchBar from "../components/SearchBar";
import CryptoChart from "../components/CryptoChart";

const Dashboard: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>(""); // State for search term
  const [selectedSymbol, setSelectedSymbol] = useState<string>("");
  return (
    <div className="dashboard container mt-5">
      <h1 className="text-center mb-4">Cryptocurrency Dashboard</h1>
      {/* SearchBar */}
      <SearchBar searchTerm={searchTerm} onSearch={setSearchTerm} />
      {/* CryptoTable */}
      <CryptoTable searchTerm={searchTerm} onSelect={setSelectedSymbol} />
      <h4 className="text-center mb-4">Cryptocurrency Chart</h4>
      {selectedSymbol && (<CryptoChart symbol = {selectedSymbol} />)}
    </div>
  );
};

export default Dashboard;
