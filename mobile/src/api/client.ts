import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// Retrieve API URL from environment variables, defaulting to live public tunnel URL
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://metal-chefs-pick.loca.lt/api';

const client = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Bypass-Tunnel-Reminder': 'true',
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
