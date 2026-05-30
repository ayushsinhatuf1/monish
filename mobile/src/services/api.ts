import axios from 'axios';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

// Use localhost for iOS simulator, 10.0.2.2 for Android emulator
const getBaseUrl = () => {
  if (__DEV__) {
    return Platform.OS === 'android' ? 'http://10.0.2.2:3000/api' : 'http://localhost:3000/api';
  }
  return 'https://api.monish.com/api'; // Prod URL
};

export const api = axios.create({
  baseURL: getBaseUrl(),
  timeout: 10000,
});

api.interceptors.request.use(async (config) => {
  try {
    const token = await SecureStore.getItemAsync('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (error) {
    console.error('Error fetching token:', error);
  }
  return config;
});

// Handling token refresh is complex for MVP, we'll implement a basic version or skip for now.
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // TODO: Implement token refresh logic or logout user
    }
    return Promise.reject(error);
  }
);
