import axios from 'axios';
import { getAccessToken, logout } from './authService';
const token = localStorage.getItem('jwtToken'); // Retrieve the token from local storage or cookies

const axiosInstance = axios.create({
    baseURL: "http://localhost:5000/api/",
    headers : {
        Authorization: `Bearer ${token}`, // Attach the JWT token
    },
});

axiosInstance.interceptors.request.use((config) => {
    const token = getAccessToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            logout();
            window.location.href = "/login";
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;
