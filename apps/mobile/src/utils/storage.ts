import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const AccessToken = 'access_token';
const RefreshToken = 'refresh_token';

async function setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web') {
        try {
            localStorage.setItem(key, value);
        } catch (error) {
            console.error('Failed to save to local storage:', error);
        }
        return;
    }

    await SecureStore.setItemAsync(key, value);
}

async function getItem(key: string): Promise<string | null> {
    if (Platform.OS === 'web') {
        try {
            return localStorage.getItem(key);
        } catch (error) {
            console.error('Failed to read from local storage:', error);
            return null;
        }
    }

    return SecureStore.getItemAsync(key);
}

async function removeItem(key: string): Promise<void> {
    if (Platform.OS === 'web') {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.error('Failed to remove from local storage:', error);
        }
        return;
    }

    await SecureStore.deleteItemAsync(key);
}

export async function saveTokens(accessToken: string, refreshToken: string): Promise<void> {
    await setItem(AccessToken, accessToken);
    await setItem(RefreshToken, refreshToken);
}

export async function getTokens(): Promise<{
    accessToken: string | null;
    refreshToken: string | null;
}> {
    const accessToken = await getItem(AccessToken);
    const refreshToken = await getItem(RefreshToken);
    return { accessToken, refreshToken };
}

export async function clearTokens(): Promise<void> {
    await removeItem(AccessToken);
    await removeItem(RefreshToken);
}
