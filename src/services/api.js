import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '@env';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// List of endpoints that DO NOT require token
const skipAuthRoutes = [
  '/api/v1/users/check_uniqueness',
  '/api/v1/users/send_verification',
  '/api/v1/users/register',
  '/api/v1/users/login',
  '/api/v1/users/refresh',
];

api.interceptors.request.use(async (config) => {
  if (!config.url) {
    console.error('Request config.url is undefined');
    return config;
  }

  const url = config.url.startsWith('http') && config.baseURL
    ? config.url.replace(config.baseURL, '')
    : config.url;

  if (!skipAuthRoutes.includes(url)) {
    const token = await AsyncStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  console.log('api.js: Request:', config.method.toUpperCase(), config.url, config.headers);
  return config;
});


api.interceptors.response.use(
  (response) => {
    console.log('api.js: Response:', response.status, response.data);
    return response;
  },
  (error) => {
    console.error('api.js: Response error:', error.response?.status, error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api;
