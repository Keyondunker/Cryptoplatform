import React, { useState, useEffect } from "react";
import { HubConnectionBuilder } from "@microsoft/signalr";
import axios from "axios";
import { FaSort, FaSortUp, FaSortDown } from "react-icons/fa";
import "./CryptoTable.css";

interface CryptoData {
  symbol: string;
  name: string;
  price: number;
  marketCap: number;
  volume24h: number;
}

interface CryptoTableProps {
  searchTerm: string;
  onSelect: (symbol: string) => void;
}

const CryptoTable: React.FC<CryptoTableProps> = ({ searchTerm, onSelect }) => {
  const [cryptoData, setCryptoData] = useState<CryptoData[]>([]);
  const [filteredData, setFilteredData] = useState<CryptoData[]>([]);
  const [sortField, setSortField] = useState<keyof CryptoData | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchCryptoData = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await axios.get("http://localhost:5000/api/cryptodata");
        setCryptoData(response.data);
        setFilteredData(response.data);
      } catch (error) {
        setError("Failed to load cryptocurrency data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchCryptoData();
  }, []);

  useEffect(() => {
    const connectSignalR = async () => {
      const connection = new HubConnectionBuilder()
        .withUrl("http://localhost:5000/cryptoDataHub", {
          skipNegotiation: true,
          transport : 1,
        })
        .configureLogging("info")
        .withAutomaticReconnect()
        .build();

      connection.on("ReceiveCryptoData", (data: CryptoData[]) => {
        setCryptoData(data);
        applySearchAndSort(data, searchTerm);
      });

      try {
        await connection.start();
        console.log("Connected to SignalR hub");
      } catch (error) {
        setError("Error connecting to live updates.");
      }
    };

    connectSignalR();
  }, [searchTerm]);

  useEffect(() => {
    applySearchAndSort(cryptoData, searchTerm);
  }, [searchTerm, sortField, sortDirection, cryptoData]);

  const applySearchAndSort = (data: CryptoData[], query: string) => {
    let filtered = data.filter(
      (crypto) =>
        crypto.name.toLowerCase().includes(query.toLowerCase()) ||
        crypto.symbol.toLowerCase().includes(query.toLowerCase())
    );

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
    setCurrentPage(1);
  };

  const handleSort = (field: keyof CryptoData) => {
    const direction = sortField === field && sortDirection === "asc" ? "desc" : "asc";
    setSortField(field);
    setSortDirection(direction);
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const handlePageChange = (page: number) => setCurrentPage(page);

  return (
    <div className="crypto-table-wrapper">
      <h1 className="text-center">Cryptocurrency Prices</h1>

      {loading ? (
        <div className="loading">Loading market data...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : (
        <div className="table-container">
          <table className="crypto-table">
            <thead>
              <tr>
                {["symbol", "name", "price", "marketCap", "volume24h"].map((field) => (
                  <th key={field} onClick={() => handleSort(field as keyof CryptoData)}>
                    {field.toUpperCase()}{" "}
                    {sortField === field ? (
                      sortDirection === "asc" ? <FaSortUp /> : <FaSortDown />
                    ) : (
                      <FaSort />
                    )}
                  </th>
                ))}
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {currentData.length > 0 ? (
                currentData.map((crypto, index) => (
                  <tr key={index}>
                    <td>{crypto.symbol.toUpperCase()}</td>
                    <td>{crypto.name}</td>
                    <td>${crypto.price.toFixed(2)}</td>
                    <td>${crypto.marketCap.toLocaleString()}</td>
                    <td>${crypto.volume24h.toLocaleString()}</td>
                    <td>
                      <button className="select-btn" onClick={() => onSelect(crypto.symbol)}>
                        Select
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center">
                    No results found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <div className="pagination">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                className={`page-btn ${page === currentPage ? "active" : ""}`}
                onClick={() => handlePageChange(page)}
              >
                {page}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CryptoTable;
