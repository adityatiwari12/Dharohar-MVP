import axios from 'axios';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// In Expo, localhost points to the device itself.
// To connect to your local PC dev server from an Android emulator, use 10.0.2.2
// For iOS Simulator, localhost or 127.0.0.1 works.
// For physical devices, you must use your computer's local network IP (e.g., 192.168.x.x)
const getBaseUrl = () => {
    if (__DEV__) {
        if (Platform.OS === 'android') return 'http://10.0.2.2:5000';
        return 'http://localhost:5000';
    }
    // Production URL would go here
    return 'https://dharohar-api.example.com';
};

export const API_BASE_URL = getBaseUrl();

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: { 'Content-Type': 'application/json' },
    timeout: 10000,
});

// Automatically attach auth token to every request
apiClient.interceptors.request.use(async (config) => {
    try {
        const token = await AsyncStorage.getItem('userToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    } catch (e) {
        // Ignored
    }
    return config;
}, (error) => Promise.reject(error));

// Handle session expiry globally
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            await AsyncStorage.removeItem('userToken');
            await AsyncStorage.removeItem('userRole');
            await AsyncStorage.removeItem('userData');
            // We don't have window.location in React Native, 
            // The routing state will naturally detect the missing token on next mount
            // or the component catching the error should redirect.
        }
        return Promise.reject(error);
    }
);

export default apiClient;
