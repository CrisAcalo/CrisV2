import axios from 'axios';

// Create a configured Axios instance
export const axiosClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor to attach JWT token to every request automatically
axiosClient.interceptors.request.use(
    (config) => {
        // In a real browser environment, fetch the token from localStorage or Zustand store
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);
