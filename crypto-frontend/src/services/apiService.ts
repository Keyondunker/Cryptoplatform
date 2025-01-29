import axios from "axios";

const BASE_URL = "http://localhost:5000/api";
const AI_BASE_URL = "http://localhost:8000";
export const fetchCryptoData = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/cryptodata`);
    return response.data;
  } catch (error) {
    console.error("Error fetching crypto data:", error);
    throw error;
  }
};

export const saveUserPreferences = async (preferences: any) => {
  try {
    const response = await axios.post(`${BASE_URL}/preferences`, preferences);
    return response.data;
  } catch (error) {
    console.error("Error saving user preferences:", error);
    throw error;
  }
};

export const fetchUserPreferences = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/preferences`);
    return response.data;
  } catch (error) {
    console.error("Error fetching user preferences:", error);
    throw error;
  }
};

// Fetch crypto data
export const fetchCryptoAIData = async () => {
  const response = await axios.get(`${AI_BASE_URL}/fetch_crypto_data`);
  return response.data;
};


// Get anomaly detection results
export const getAnomalies = async () => {
  const response = await axios.get(`${AI_BASE_URL}/anomalies`);
  return response.data;
};

// Get sentiment analysis results
export const getSentimentAnalysis = async (period : number) => {
  try {
    const response = await axios.get(`${AI_BASE_URL}/sentiment?period=${period}`);
    if (Array.isArray(response.data.sentiment_analysis)) {
      return response.data.sentiment_analysis;
    } else {
      console.error("Invalid response format:", response.data);
      return [];
    }
  } catch (error) {
    console.error("Error fetching sentiment data:", error);
    return [];
  }
};