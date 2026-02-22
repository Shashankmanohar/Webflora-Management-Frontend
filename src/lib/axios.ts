import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL, API_TIMEOUT } from '@/config/api';

// Create axios instance
const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    timeout: API_TIMEOUT,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor - attach JWT token
axiosInstance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('token');
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error: AxiosError) => {
        return Promise.reject(error);
    }
);

// Response interceptor - handle errors
axiosInstance.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        // Handle 401 Unauthorized - token expired or invalid
        // Only logout if we have a token (prevents logout on initial load)
        if (error.response?.status === 401) {
            const token = localStorage.getItem('token');
            if (token) {
                // Only clear auth if user was actually logged in
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                // Only redirect if not already on login page
                if (!window.location.pathname.includes('/login')) {
                    window.location.href = '/login';
                }
            }
        }

        // Handle 403 Forbidden - insufficient permissions
        if (error.response?.status === 403) {
            console.error('Access denied');
        }

        // Handle network errors
        if (!error.response) {
            console.error('Network error - please check your connection');
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;
