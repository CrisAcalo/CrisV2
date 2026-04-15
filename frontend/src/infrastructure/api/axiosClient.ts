import axios from 'axios';

// Create a configured Axios instance
export const axiosClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor: attach JWT token to every request automatically
axiosClient.interceptors.request.use(
    (config) => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor: dispatch a custom DOM event on 401/403.
// This decouples the HTTP client from React hooks — the AuthWatcher
// component listens to 'auth:unauthorized' and performs logout + redirect.
axiosClient.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;
        if ((status === 401 || status === 403) && typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('auth:unauthorized'));
        }
        return Promise.reject(error);
    }
);
