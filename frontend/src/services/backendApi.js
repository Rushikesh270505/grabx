import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const auth = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/password', data),
};

// User API calls
export const users = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  uploadAvatar: () => api.post('/users/avatar'),
  getStats: () => api.get('/users/stats'),
  getPreferences: () => api.get('/users/preferences'),
  updatePreferences: (data) => api.put('/users/preferences', data),
  deleteAccount: () => api.delete('/users/account'),
};

// Wallet API calls
export const wallets = {
  getAll: () => api.get('/wallets'),
  get: (id) => api.get(`/wallets/${id}`),
  create: (data) => api.post('/wallets', data),
  update: (id, data) => api.put(`/wallets/${id}`, data),
  sync: (id) => api.post(`/wallets/${id}/sync`),
  delete: (id) => api.delete(`/wallets/${id}`),
  getStats: (id) => api.get(`/wallets/${id}/stats`),
};

// Bot API calls
export const bots = {
  getAll: (params) => api.get('/bots', { params }),
  get: (id) => api.get(`/bots/${id}`),
  create: (data) => api.post('/bots', data),
  update: (id, data) => api.put(`/bots/${id}`, data),
  start: (id) => api.post(`/bots/${id}/start`),
  stop: (id) => api.post(`/bots/${id}/stop`),
  delete: (id) => api.delete(`/bots/${id}`),
  getTrades: (id, params) => api.get(`/bots/${id}/trades`, { params }),
  getSignals: (id, params) => api.get(`/bots/${id}/signals`, { params }),
  getLogs: (id, params) => api.get(`/bots/${id}/logs`, { params }),
};

// Market API calls
export const markets = {
  getTicker: (symbol) => api.get(`/markets/ticker/${symbol}`),
  getKlines: (symbol, params) => api.get(`/markets/klines/${symbol}`, { params }),
  getOrderbook: (symbol, params) => api.get(`/markets/orderbook/${symbol}`, { params }),
  getTrades: (symbol, params) => api.get(`/markets/trades/${symbol}`, { params }),
  getExchangeInfo: () => api.get('/markets/exchange-info'),
  get24hrTicker: () => api.get('/markets/ticker/24hr'),
  searchSymbols: (query) => api.get(`/markets/search/${query}`),
  getPopular: () => api.get('/markets/popular'),
};

export default api;
