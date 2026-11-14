import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { getTokens, saveTokens, clearTokens } from '../utils/storage';

// Set EXPO_PUBLIC_API_URL for production. In development, reuse the
// Metro/browser host so physical devices and emulators can reach the API.
function getDevHost(): string | null {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
        // Expo bakes `hostUri` as localhost for web; the browser address is
        // what actually tells us which machine the app was loaded from.
        return window.location.hostname || null;
    }

    return Constants.expoConfig?.hostUri?.split(':')[0] ?? null;
}

const devHost = getDevHost();
const API_BASE_URL =
    process.env.EXPO_PUBLIC_API_URL ??
    (devHost ? `http://${devHost}:3000` : 'http://localhost:3000');

if (__DEV__) {
    console.log('[api] base url:', API_BASE_URL);
}

type RetriableRequest = InternalAxiosRequestConfig & { _retry?: boolean };

export const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
})

api.interceptors.request.use(async (config) => {
    const { accessToken } = await getTokens();
    if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as RetriableRequest | undefined;

        if (error.response?.status !== 401 || !originalRequest || originalRequest._retry) {
            return Promise.reject(error);
        }

        originalRequest._retry = true;
        const { refreshToken } = await getTokens();

        if (!refreshToken) {
            return Promise.reject(error);
        }

        try {
            const { data } = await axios.post<{ accessToken: string; refreshToken: string }>(
                `${API_BASE_URL}/auth/refresh-token`,
                { refreshToken },
            );
            await saveTokens(data.accessToken, data.refreshToken);
            originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
            return api(originalRequest);
        } catch (refreshError) {
            await clearTokens();
            return Promise.reject(refreshError);
        }
    },
);
