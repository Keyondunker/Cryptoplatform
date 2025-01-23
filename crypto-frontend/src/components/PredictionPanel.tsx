import React, { useState } from "react";
import axios from "axios";
import { FaSyncAlt, FaChartLine, FaExclamationTriangle } from "react-icons/fa";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";
import "./PredictionPanel.css";

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const PredictionPanel: React.FC = () => {
    const [selectedName, setSelectedName] = useState<string>("");
    const [trainingDays, setTrainingDays] = useState<number>(30);
    const [price, setPrice] = useState<number | string>("");
    const [marketCap, setMarketCap] = useState<number | null>(null);
    const [volume24h, setVolume24h] = useState<number | null>(null);
    const [days, setDays] = useState<number>(7); // Number of prediction days
    const [predictions, setPredictions] = useState<{ date: string; predicted_price: number }[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    // Handles training the model
    const handleTrain = async () => {
        setError(null);
        setLoading(true);
        try {
            await axios.post(`http://localhost:5000/api/cryptodata/train-model?_Name=${selectedName}&days=${trainingDays}`);
            alert("Model trained successfully!");
        } catch (err) {
            setError("Failed to train model. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // Fetches cryptocurrency market cap and volume automatically
    const fetchCryptoDetails = async () => {
        if (!selectedName.trim()) {
            setError("Please enter a valid cryptocurrency name.");
            return;
        }

        setError(null);
        setLoading(true);

        try {
            const response = await axios.get(`http://localhost:5000/api/cryptodata/details?name=${selectedName}`);
            const { marketCap, volume24h } = response.data;
            setMarketCap(marketCap);
            setVolume24h(volume24h);
        } catch (err) {
            setError("Failed to fetch cryptocurrency details. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // Handles predicting cryptocurrency prices for multiple days
    const handlePredict = async () => {
        if (!marketCap || !volume24h) {
            setError("Market Cap and Volume data are required.");
            return;
        }

        setError(null);
        setPredictions([]);
        setLoading(true);

        try {
            const response = await axios.post("http://127.0.0.1:8000/predict", {
                market_cap: Number(marketCap),
                volume_24h: Number(volume24h),
                days: days,
            });

            setPredictions(response.data.predictions);
        } catch (err) {
            setError("Failed to fetch prediction. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // Chart.js data for visualization
    const chartData = {
        labels: predictions.map((p) => p.date),
        datasets: [
            {
                label: "Predicted Price",
                data: predictions.map((p) => p.predicted_price),
                borderColor: "rgba(75,192,192,1)",
                fill: false,
                tension: 0.4,
            },
        ],
    };

    return (
        <div className="prediction-container">
            <h1 className="text-center">Cryptocurrency AI Price Prediction</h1>
            
            <div className="form-group">
                <label>Cryptocurrency Name (e.g., Bitcoin):</label>
                <input
                    type="text"
                    className="form-control"
                    placeholder="Enter crypto name"
                    value={selectedName}
                    onChange={(e) => setSelectedName(e.target.value)}
                />
            </div>

            <div className="form-group">
                <label>Training Days:</label>
                <input
                    type="number"
                    className="form-control"
                    value={trainingDays}
                    onChange={(e) => setTrainingDays(Number(e.target.value))}
                />
            </div>

            <div className="form-group">
                <label>Number of Prediction Days:</label>
                <input
                    type="number"
                    className="form-control"
                    value={days}
                    onChange={(e) => setDays(Number(e.target.value))}
                />
            </div>

            <div className="button-group">
                <button className="btn btn-primary" onClick={handleTrain} disabled={loading}>
                    {loading ? <FaSyncAlt className="loading-icon" /> : "Train Model"}
                </button>
                <button className="btn btn-secondary" onClick={fetchCryptoDetails} disabled={loading}>
                    {loading ? <FaSyncAlt className="loading-icon" /> : "Fetch Details"}
                </button>
            </div>

            {marketCap !== null && (
                <div className="crypto-details">
                    <p><strong>Market Cap:</strong> ${marketCap.toLocaleString()}</p>
                    <p><strong>24h Volume:</strong> ${volume24h?.toLocaleString()}</p>
                </div>
            )}

            <button className="btn btn-success mt-3" onClick={handlePredict} disabled={loading}>
                {loading ? <FaSyncAlt className="loading-icon" /> : "Predict Price"}
            </button>

            {error && <div className="alert alert-danger mt-3"><FaExclamationTriangle /> {error}</div>}

            {predictions.length > 0 && (
                <div className="mt-4">
                    <h3>Predicted Price Chart</h3>
                    <Line data={chartData} />
                </div>
            )}
        </div>
    );
};

export default PredictionPanel;
