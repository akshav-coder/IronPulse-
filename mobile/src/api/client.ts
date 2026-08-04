import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// Retrieve API URL from environment variables, defaulting to laptop Wi-Fi IP
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.38:5000/api';

const client = axios.create({
  baseURL: API_URL,
  timeout: 10000, // 10 second timeout to fail fast on network issues
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
