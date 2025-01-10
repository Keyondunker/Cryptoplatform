import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import axios from "axios";
import "./CryptoChart.css";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend,
} from "chart.js";

// Register Chart.js components
ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend);

interface HistoricalData {
  date: string; // e.g., "2023-01-01"
  price: number; // e.g., 45000
}

interface CryptoChartProps {
  symbol: string; // Symbol of the cryptocurrency (e.g., "BTC")
}

const CryptoChart: React.FC<CryptoChartProps> = ({ symbol }) => {
  const [chartData, setChartData] = useState<HistoricalData[]>([]);

  useEffect(() => {
    // Fetch historical data from the backend
    const fetchHistoricalData = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/cryptodata/history/${symbol}`
        );
        setChartData(response.data);
      } catch (error) {
        console.error("Error fetching historical data:", error);
      }
    };

    if (symbol) fetchHistoricalData();
  }, [symbol]);

  // Prepare data for the chart
  const data = {
    labels: chartData.map((item) => item.date), // Dates for X-axis
    datasets: [
      {
        label: `${symbol} Price (USD)`,
        data: chartData.map((item) => item.price), // Prices for Y-axis
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        borderWidth: 2,
        tension: 0.4, // Smooth curves
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: "top" as const,
      },
      tooltip: {
        enabled: true,
      },
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: "Date",
        },
      },
      y: {
        display: true,
        title: {
          display: true,
          text: "Price (USD)",
        },
      },
    },
  };

  return (
    <div className="crypto-chart-container">
      <h2 className="text-center mb-4">{symbol} Price History</h2>
      <Line data={data} options={options} />
    </div>
  );
};

export default CryptoChart;
