import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import axios from 'axios';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
  } from 'chart.js';

  ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
  );

interface HistoricalData {
    date: string; // Match backend response structure
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
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchHistoricalData = async () => {
            try {
                const response = await axios.get(
                    `http://localhost:5000/api/cryptodata/history?symbol=${symbol}`
                );
                setHistoricalData(response.data);
            } catch (err) {
                setError('Failed to fetch historical data.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

                                                                                                                                                                                                                                                                                                                    fetchHistoricalData();
    }, [symbol]);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;
    if (historicalData.length === 0) return <div>No data available</div>;

    const labels = historicalData.map(data => data.date);
    const prices = historicalData.map(data => data.price);

    const chartData = {
        labels,
        datasets: [
            {
                label: `Price (USD) for ${symbol}`,
                data: prices,
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
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
                position: 'top' as const,
            },
        },
    };

    return (
        <div className="chart-container">
            <h2>Historical Price Chart for {symbol}</h2>
            <Line data={chartData} options={options} />
        </div>
    );
};

export default CryptoChart;
