import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import axios from "axios";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import "./CryptoChart.css"; // For modern styling

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface HistoricalData {
  date: string;
  price: number;
  marketCap: number;
  volume24h: number;
}

interface CryptoChartProps {
  symbol: string;
}

const CryptoChart: React.FC<CryptoChartProps> = ({ symbol }) => {
  const [historicalData, setHistoricalData] = useState<HistoricalData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchHistoricalData = async () => {
      try {
        setError(""); // Reset error state
        const response = await axios.get(
          `http://localhost:5000/api/cryptodata/history?symbol=${symbol}`
        );
        setHistoricalData(response.data);
      } catch (err) {
        setError("Failed to fetch historical data. Please try again later.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistoricalData();
  }, [symbol]);

  // Loading state
  if (loading) {
    return (
      <div className="chart-loading-container">
        <div className="loading-spinner"></div>
        <p>Loading historical data for {symbol}...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="chart-error-container">
        <p className="error-message">{error}</p>
      </div>
    );
  }

  // No data state
  if (historicalData.length === 0) {
    return (
      <div className="chart-no-data-container">
        <p>No historical data available for {symbol}.</p>
      </div>
    );
  }

  // Prepare chart data
  const labels = historicalData.map((data) => data.date);
  const prices = historicalData.map((data) => data.price);
  const marketCaps = historicalData.map((data) => data.marketCap);
  const volumes = historicalData.map((data) => data.volume24h);

  const chartData = {
    labels,
    datasets: [
      {
        label: `Price (USD)`,
        data: prices,
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        borderWidth: 2,
        tension: 0.4, // Smooth curve
      },
      {
        label: `Market Cap (USD)`,
        data: marketCaps,
        borderColor: "rgba(153, 102, 255, 1)",
        backgroundColor: "rgba(153, 102, 255, 0.2)",
        borderWidth: 2,
        tension: 0.4,
      },
      {
        label: `24h Volume (USD)`,
        data: volumes,
        borderColor: "rgba(255, 159, 64, 1)",
        backgroundColor: "rgba(255, 159, 64, 0.2)",
        borderWidth: 2,
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: "top" as const,
        labels: {
          color: "rgba(0, 0, 0, 0.8)",
          font: {
            size: 14,
          },
        },
      },
      title: {
        display: true,
        text: `Historical Data for ${symbol}`,
        font: {
          size: 18,
          weight: "bold" as const,
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: "rgba(0, 0, 0, 0.8)",
        },
      },
      y: {
        ticks: {
          color: "rgba(0, 0, 0, 0.8)",
        },
      },
    },
  };

  return (
    <div className="chart-container">
      <Line data={chartData} options={options} />
    </div>
  );
};

export default CryptoChart;
