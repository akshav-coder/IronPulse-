import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// Live public API endpoint via Serveo tunnel
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://d231b5872dc16128-120-56-109-226.serveousercontent.com/api';

const client = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to dynamically inject the stored JWT token
client.interceptors.request.use(
  async (config) => {
    try {
      const token = await SecureStore.getItemAsync('userToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('SecureStore retrieve token error:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default client;
