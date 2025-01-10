import axios from "axios";

const BASE_URL = "http://localhost:5000/api";

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
