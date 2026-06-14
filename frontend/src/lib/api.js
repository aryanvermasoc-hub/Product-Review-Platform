import axios from 'axios';

const api = axios.create({
  // Dynamically uses your Render backend in production, and relative paths locally
  baseURL: `${import.meta.env.VITE_API_URL || ''}/api`,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const stored = localStorage.getItem('userInfo');
  if (stored) {
    const user = JSON.parse(stored);
    if (user?.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('userInfo');
      window.location.href = '/login?expired=true';
    }
    return Promise.reject(error);
  }
);

export default api;
