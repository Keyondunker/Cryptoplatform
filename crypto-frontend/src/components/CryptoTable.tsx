import React, { useState, useEffect } from "react";
import { HubConnectionBuilder } from "@microsoft/signalr";
import axios from "axios";
import "./CryptoTable.css";

interface CryptoData {
  symbol: string;
  name: string;
  price: number;
  marketCap: number;
  volume24h: number;
}

interface CryptoTableProps {
  searchTerm: string; // Search term passed from parent component
  onSelect: (symbol: string) => void; // Callback to handle cryptocurrency selection
}

const CryptoTable: React.FC<CryptoTableProps> = ({ searchTerm, onSelect }) => {
  const [cryptoData, setCryptoData] = useState<CryptoData[]>([]);
  const [filteredData, setFilteredData] = useState<CryptoData[]>([]);
  const [sortField, setSortField] = useState<keyof CryptoData | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // Rows per page

  // Fetch cryptocurrency data from the backend
  useEffect(() => {
    const fetchCryptoData = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/cryptodata");
        setCryptoData(response.data);
        setFilteredData(response.data);
      } catch (error) {
        console.error("Error fetching crypto data:", error);
      }
    };

    fetchCryptoData();
  }, []);

  // SignalR connection to update live data
  useEffect(() => {
    const connectSignalR = async () => {
      const connection = new HubConnectionBuilder()
        .withUrl("http://localhost:5000/cryptoDataHub")
        .withAutomaticReconnect()
        .build();

      connection.on("ReceiveCryptoData", (data: CryptoData[]) => {
        setCryptoData(data);
        applySearchAndSort(data, searchTerm); // Reapply search and sort when live data updates
      });

      try {
        await connection.start();
        console.log("Connected to SignalR hub");
      } catch (error) {
        console.error("Error connecting to SignalR hub:", error);
      }
    };

    connectSignalR();
  }, [searchTerm]);

  // Apply search and sort when searchTerm or sort parameters change
  useEffect(() => {
    applySearchAndSort(cryptoData, searchTerm);
  }, [searchTerm, sortField, sortDirection, cryptoData]);

  // Function to apply search and sort
  const applySearchAndSort = (data: CryptoData[], query: string) => {
    // Filter data based on search query
    let filtered = data.filter(
      (crypto) =>
        crypto.name.toLowerCase().includes(query.toLowerCase()) ||
        crypto.symbol.toLowerCase().includes(query.toLowerCase())
    );

    // Sort data if sortField is selected
    if (sortField) {
      filtered = filtered.sort((a, b) => {
        const aValue = a[sortField]!;
        const bValue = b[sortField]!;

        if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
        if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
        return 0;
      });
    }

    setFilteredData(filtered);
    setCurrentPage(1); // Reset to the first page after search or sort
  };

  // Handle sorting by column
  const handleSort = (field: keyof CryptoData) => {
    const direction = sortField === field && sortDirection === "asc" ? "desc" : "asc";
    setSortField(field);
    setSortDirection(direction);
  };

  // Handle pagination
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const handlePageChange = (page: number) => setCurrentPage(page);

  return (
    <div className="crypto-table-wrapper">
      <div className="crypto-table-container">
        <h1 className="text-center mb-4">Cryptocurrency Prices</h1>
        <div className="table-container">
          <table className="table table-striped table-bordered">
            <thead className="thead-dark">
              <tr>
                <th onClick={() => handleSort("symbol")} style={{ cursor: "pointer" }}>
                  Symbol {sortField === "symbol" && (sortDirection === "asc" ? "▲" : "▼")}
                </th>
                <th onClick={() => handleSort("name")} style={{ cursor: "pointer" }}>
                  Name {sortField === "name" && (sortDirection === "asc" ? "▲" : "▼")}
                </th>
                <th onClick={() => handleSort("price")} style={{ cursor: "pointer" }}>
                  Price (USD) {sortField === "price" && (sortDirection === "asc" ? "▲" : "▼")}
                </th>
                <th onClick={() => handleSort("marketCap")} style={{ cursor: "pointer" }}>
                  Market Cap (USD) {sortField === "marketCap" && (sortDirection === "asc" ? "▲" : "▼")}
                </th>
                <th onClick={() => handleSort("volume24h")} style={{ cursor: "pointer" }}>
                  24h Volume (USD) {sortField === "volume24h" && (sortDirection === "asc" ? "▲" : "▼")}
                </th>
                <th>Select</th>
              </tr>
            </thead>
            <tbody>
              {currentData.length > 0 ? (
                currentData.map((crypto, index) => (
                  <tr key={index}>
                    <td>{crypto.symbol}</td>
                    <td>{crypto.name}</td>
                    <td>${crypto.price.toFixed(2)}</td>
                    <td>${crypto.marketCap.toLocaleString()}</td>
                    <td>${crypto.volume24h.toLocaleString()}</td>
                    <td>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => onSelect(crypto.symbol)} // Pass the symbol to the onSelect callback
                      >
                        Select
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center">
                    No cryptocurrencies match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {/* Pagination */}
      <div className="pagination-container">
        <nav>
          <ul className="pagination">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <li
                key={page}
                className={`page-item ${page === currentPage ? "active" : ""}`}
                onClick={() => handlePageChange(page)}
              >
                <button className="page-link">{page}</button>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default CryptoTable;
