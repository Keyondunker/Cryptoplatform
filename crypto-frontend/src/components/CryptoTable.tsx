import React, { useState, useEffect } from "react";
import { HubConnectionBuilder } from "@microsoft/signalr";
import axios from "axios";
import "./CryptoTable.css"; // Custom CSS for additional styling

interface CryptoData {
  symbol: string;
  name: string;
  price: number;
  marketCap: number;
  volume24h: number;
}

const CryptoTable: React.FC = () => {
  const [cryptoData, setCryptoData] = useState<CryptoData[]>([]);

  // Fetch initial data
  useEffect(() => {
    const fetchCryptoData = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/cryptodata");
        setCryptoData(response.data);
      } catch (error) {
        console.error("Error fetching crypto data:", error);
      }
    };

    fetchCryptoData();
  }, []);

  // SignalR connection
  useEffect(() => {
    const connectSignalR = async () => {
      const connection = new HubConnectionBuilder()
        .withUrl("http://localhost:5000/cryptoDataHub")
        .withAutomaticReconnect()
        .build();

      connection.on("ReceiveCryptoData", (data: CryptoData[]) => {
        setCryptoData(data); // Update table when new data is received
      });

      try {
        await connection.start();
        console.log("Connected to SignalR hub");
      } catch (error) {
        console.error("Error connecting to SignalR hub:", error);
      }
    };

    connectSignalR();
  }, []);

  return (
    <div className="container mt-5">
      <h1 className="text-center mb-4">Cryptocurrency Prices</h1>
      <div className="table-responsive">
        <table className="table table-striped table-bordered table-hover">
          <thead className="thead-dark">
            <tr>
              <th scope="col">Symbol</th>
              <th scope="col">Name</th>
              <th scope="col">Price (USD)</th>
              <th scope="col">Market Cap (USD)</th>
              <th scope="col">24h Volume (USD)</th>
            </tr>
          </thead>
          <tbody>
            {cryptoData.map((crypto, index) => (
              <tr key={index}>
                <td>{crypto.symbol}</td>
                <td>{crypto.name}</td>
                <td>${crypto.price.toFixed(2)}</td>
                <td>${crypto.marketCap.toLocaleString()}</td>
                <td>${crypto.volume24h.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CryptoTable;
