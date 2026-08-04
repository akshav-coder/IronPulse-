import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// Live trusted HTTPS API endpoint
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://uvzsi-120-56-99-154.run.pinggy-free.link/api';

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
