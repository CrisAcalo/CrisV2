import axios from 'axios';

export const adminSessionExpiredEvent = 'portfolio:session-expired';

export const axiosClient = axios.create({
    baseURL: '/api/admin-gateway',
    headers: {
        'Content-Type': 'application/json',
        'X-Portfolio-Request': '1',
    },
    timeout: 65_000,
});

export const publicAxiosClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api',
    headers: { 'Content-Type': 'application/json' },
});

axiosClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401 && !error.config?.url?.startsWith('/auth/') && typeof window !== 'undefined') {
            window.dispatchEvent(new Event(adminSessionExpiredEvent));
        }
        return Promise.reject(error);
    }
);
