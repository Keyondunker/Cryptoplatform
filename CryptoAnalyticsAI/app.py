from fastapi import FastAPI, Request, HTTPException
from pydantic import BaseModel
from crypto_model import CryptoModel
from fastapi.middleware.cors import CORSMiddleware
from sentiment_analysis import analyze_sentiment
from anomaly_detection import detect_anomalies
from typing import List
import numpy as np
import pandas as pd
import logging
from sklearn.linear_model import LinearRegression  # Import LinearRegression
import pickle
import datetime
from utils.data_fetcher import fetch_crypto_data

class TrainingData(BaseModel):
    Date: str
    Price: float
    MarketCap: float
    Volume24h: float

logging.basicConfig(level=logging.INFO)

app = FastAPI()
model = CryptoModel()
model.load_model("crypto_model.pkl")  # Ensure the model is pre-trained and saved

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Replace "*" with the specific domain(s) if needed
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all HTTP headers
)
class PredictionRequest(BaseModel):
    market_cap: float
    volume_24h: float
    historical_data: List[dict]
    days: int

@app.get("/")
async def read_root():
    return {"message": "Welcome to my FastAPI app!"}

@app.get("/items/{item_id}")
async def read_item(item_id: int, q: str = None):
    return {"item_id": item_id, "query": q}

@app.get("/fetch_crypto_data")
async def fetch_and_save_data():
    try:
        fetch_crypto_data('bitcoin', 'usd', days=90)
        return {"message": "Crypto data fetched and saved successfully!"}
    except Exception as e:
        return {"error": str(e)}

@app.get("/sentiment")
async def get_sentiment(days: int = 7):
    """
    Endpoint to fetch sentiment analysis data for a specified period.

    :param days: Number of days for which sentiment data is required (default: 7 days)
    :return: JSON response with sentiment analysis results
    """
    try:
        sentiment_results = analyze_sentiment('cryptocurrency', 'Bitcoin', limit=200, days=days)
        return {"sentiment_analysis": sentiment_results}
    except Exception as e:
        return {"error": str(e)}

@app.get("/anomalies")
async def get_anomalies():
    anomaly_results = detect_anomalies("data/crypto_price_data.csv")
    return {"anomalies_detected": anomaly_results}

@app.post("/train")
async def train_model(data: List[TrainingData]):
    logging.info(f"Received data: {data}")
    try:
        # Convert data to DataFrame
        df = pd.DataFrame([item.model_dump() for item in data])
        required_columns = {"Date", "Price", "MarketCap", "Volume24h"}
        if not required_columns.issubset(df.columns):
            raise HTTPException(status_code=400, detail="Missing required fields in the input data.")
        # Train the model
        X = df[["MarketCap", "Volume24h"]]
        y = df["Price"]
        model = LinearRegression()
        model.fit(X, y)
        df['MarketCapChange'] = df['MarketCap'].pct_change().fillna(0)
        df['VolumeChange'] = df['Volume24h'].pct_change().fillna(0)

        avg_market_cap_growth = df['MarketCapChange'].mean()
        avg_volume_growth = df['VolumeChange'].mean() 

        # Save the model
        with open("crypto_model.pkl", "wb") as f:
            pickle.dump({
                "model": model,
                "avg_market_cap_growth": avg_market_cap_growth,
                "avg_volume_growth": avg_volume_growth
            }, f)
        logging.info("Model trained and saved successfully.")
        return {"message": "Model trained successfully."}
    except Exception as e:
        logging.error(f"Error training model: {e}")
        raise HTTPException(status_code=500, detail=f"Error training model: {e}")


@app.post("/predict")
async def predict(data: dict):
    logging.info(f"Received prediction request: {data}")
    try:
        with open("crypto_model.pkl", "rb") as f:
            model_data = pickle.load(f)
            model = model_data["model"]
            avg_market_cap_growth = model_data["avg_market_cap_growth"]
            avg_volume_growth = model_data["avg_volume_growth"]
        logging.info("Model loaded successfully.")
        logging.info(data);
        #Ensure data contains the necessary columns
        features = np.array([[data['market_cap'], data['volume_24h']]])
        logging.info(features)
        predictions = []

        for day in range(1, data['days'] + 1):
            # Apply the observed average percentage changes
            features[0][0] *= (1 + avg_market_cap_growth)
            features[0][1] *= (1 + avg_volume_growth)

            predicted_price = model.predict(features)[0]
            predictions.append({
                "date": (datetime.date.today() + datetime.timedelta(days=day)).isoformat(),
                "predicted_price": round(predicted_price, 2)
            })

        return {"predictions": predictions}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
