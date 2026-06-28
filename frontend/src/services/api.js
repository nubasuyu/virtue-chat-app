import axios from 'axios';

// Create an Axios instance. 
// Because of our Vite proxy, '/api' automatically goes to 'http://localhost:5000/api'
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api', 
});

// Add a request interceptor to attach the token if it exists
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