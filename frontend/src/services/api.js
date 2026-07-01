import axios from 'axios';

// Use environment variable for production, or '/api' for local dev (Vite proxy)
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api', 
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;