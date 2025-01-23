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
  const [selectedMetric, setSelectedMetric] = useState<string>("price");

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

  // Prepare chart data based on selected metric
  const labels = historicalData.map((data) => data.date);
  const dataMap: Record<string, { label: string; data: number[]; color: string }> = {
    price: {
      label: `Price (USD)`,
      data: historicalData.map((data) => data.price),
      color: "rgba(75, 192, 192, 1)",
    },
    marketCap: {
      label: `Market Cap (USD)`,
      data: historicalData.map((data) => data.marketCap),
      color: "rgba(153, 102, 255, 1)",
    },
    volume24h: {
      label: `24h Volume (USD)`,
      data: historicalData.map((data) => data.volume24h),
      color: "rgba(255, 159, 64, 1)",
    },
  };

  const chartData = {
    labels,
    datasets: [
      {
        label: dataMap[selectedMetric].label,
        data: dataMap[selectedMetric].data,
        borderColor: dataMap[selectedMetric].color,
        backgroundColor: dataMap[selectedMetric].color.replace("1)", "0.2)"), // Adjust opacity
        borderWidth: 2,
        tension: 0.4, // Smooth curve
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
        text: `Historical ${dataMap[selectedMetric].label} for ${symbol}`,
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
      <div className="chart-options">
        <label>Select Metric:</label>
        <select
          value={selectedMetric}
          onChange={(e) => setSelectedMetric(e.target.value)}
          className="form-select"
        >
          <option value="price">Price (USD)</option>
          <option value="marketCap">Market Cap (USD)</option>
          <option value="volume24h">24h Volume (USD)</option>
        </select>
      </div>

      <Line data={chartData} options={options} />
    </div>
  );
};

export default CryptoChart;
