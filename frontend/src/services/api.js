import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
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

export const interactionAPI = {
  create: (data) => api.post('/interactions', data),
  getAll: () => api.get('/interactions'),
  getOne: (id) => api.get(`/interactions/${id}`),
  update: (id, data) => api.put(`/interactions/${id}`, data),
  delete: (id) => api.delete(`/interactions/${id}`),
};

export const chatAPI = {
  send: (message, sessionId = null) =>
    api.post('/chat', { message, sessionId }),
};

export default api;