import React, { useState } from "react";
import axios from "axios";
import { FaSyncAlt, FaChartLine, FaExclamationTriangle } from "react-icons/fa";
import "./PredictionPanel.css";

const PredictionPanel: React.FC = () => {
    const [selectedName, setSelectedName] = useState<string>("");
    const [trainingDays, setTrainingDays] = useState<number>(30);
    const [price, setPrice] = useState<number | string>("");
    const [marketCap, setMarketCap] = useState<number | null>(null);
    const [volume24h, setVolume24h] = useState<number | null>(null);
    const [prediction, setPrediction] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    // Handles training the model
    const handleTrain = async () => {
        setError(null);
        setLoading(true);
        try {
            const response = await axios.post(`http://localhost:5000/api/cryptodata/train-model?_Name=${selectedName}&days=${trainingDays}`);
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

    // Handles predicting cryptocurrency prices
    const handlePredict = async () => {
        if (!marketCap || !volume24h) {
            setError("Market Cap and Volume data are required.");
            return;
        }

        setError(null);
        setPrediction(null);
        setLoading(true);

        try {
            const response = await axios.post("http://127.0.0.1:8000/predict", {
                price: Number(price),
                market_cap: Number(marketCap),
                volume_24h: Number(volume24h),
            });
            setPrediction(`Predicted Price: $${response.data.prediction.toFixed(2)}`);
        } catch (err) {
            setError("Failed to fetch prediction. Please try again.");
        } finally {
            setLoading(false);
        }
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

            <div className="form-group mt-3">
                <label>Price (Optional for prediction):</label>
                <input
                    type="number"
                    className="form-control"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                />
            </div>

            <button className="btn btn-success mt-3" onClick={handlePredict} disabled={loading}>
                {loading ? <FaSyncAlt className="loading-icon" /> : "Predict Price"}
            </button>

            {error && <div className="alert alert-danger mt-3"><FaExclamationTriangle /> {error}</div>}
            {prediction && <div className="alert alert-success mt-3"><FaChartLine /> {prediction}</div>}
        </div>
    );
};

export default PredictionPanel;
