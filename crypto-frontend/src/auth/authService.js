import axios from 'axios';

const API_URL = "http://localhost:5000/api/auth/";

export const login = async (username, password) => {
    try {
        const response = await axios.post(`${API_URL}login`, { username, password });
        const { accessToken, refreshToken } = response.data;

        // Save tokens in localStorage
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);

        return response.data;
    } catch (error) {
        console.error("Login failed:", error.response?.data || error.message);
        throw error;
    }
};

export const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
};

export const getAccessToken = () => localStorage.getItem("accessToken");
