import axios from 'axios';

const api = axios.create({
  // If you use Vite proxy (recommended) use relative paths like '/auth'
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
  withCredentials: true,
});

export default api;
