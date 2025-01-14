import React, { useState } from "react";
import axios from "axios";

const PredictPage: React.FC = () => {
    const [selectedName, setSelectedName] = useState<string>("");
    const [trainingDays, setTrainingDays] = useState<number>(30);
    const [price, setPrice] = useState<number | string>("");
    const [marketCap, setMarketCap] = useState<number | string>("");
    const [volume24h, setVolume24h] = useState<number | string>("");
    const [prediction, setPrediction] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleTrain = async () => {
        setError(null);

        try {
            const response = await axios.post(`http://localhost:5000/api/cryptodata/train-model?_Name=${selectedName}&days=${trainingDays}`);
            alert(response.data);
        } catch (err) {
            setError("Failed to train model. Please try again.");
            console.error(err);
        }
    };

    const handlePredict = async () => {
        setError(null);
        setPrediction(null);

        if (!marketCap || !volume24h) {
            setError("All fields are required.");
            return;
        }

        try {
            const response = await axios.post("http://127.0.0.1:8000/predict", {
                price: Number(price),
                market_cap: Number(marketCap),
                volume_24h: Number(volume24h),
            });
            setPrediction(`Predicted Price: $${response.data.prediction.toFixed(2)}`);
        } catch (err) {
            setError("Failed to fetch prediction. Please try again.");
            console.error(err);
        }
    };

    return (
        <div className="container mt-5">
            <h1 className="text-center mb-4">Cryptocurrency AI Price Prediction</h1>
            
            <div className="form-group">
                <label>Cryptocurrency Name (e.g., bitcoin):</label>
                <input
                    type="text"
                    className="form-control"
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
            <button className="btn btn-primary mt-3" onClick={handleTrain}>
                Train Model
            </button>

            <div className="form-group mt-4">
                <label>Market Cap (USD):</label>
                <input
                    type="number"
                    className="form-control"
                    value={marketCap}
                    onChange={(e) => setMarketCap(e.target.value)}
                />
            </div>
            <div className="form-group">
                <label>24h Volume (USD):</label>
                <input
                    type="number"
                    className="form-control"
                    value={volume24h}
                    onChange={(e) => setVolume24h(e.target.value)}
                />
            </div>
            <button className="btn btn-primary mt-3" onClick={handlePredict}>
                Predict
            </button>

            {error && <div className="alert alert-danger mt-3">{error}</div>}
            {prediction && <div className="alert alert-success mt-3">{prediction}</div>}
        </div>
    );
};

export default PredictPage;
