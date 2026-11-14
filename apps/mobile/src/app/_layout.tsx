import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import type { ComponentProps } from 'react';
import { ActivityIndicator, useColorScheme, View } from 'react-native';

import '@/global.css';
import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { ColorSchemeSync } from '@/components/color-scheme-sync';
import { useAuth } from '@/context/AuthContext';
import { AuthProvider } from '@/context/AuthProvider';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
    const colorScheme = useColorScheme();

    return (
        <ThemeProvider
            value={
                (colorScheme === 'dark' ? DarkTheme : DefaultTheme) as ComponentProps<
                    typeof ThemeProvider
                >['value']
            }
        >
            <ColorSchemeSync />
            <AuthProvider>
                <AnimatedSplashOverlay />
                <RootNavigator />
            </AuthProvider>
        </ThemeProvider>
    );
}

function RootNavigator() {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return (
            <View className="flex-1 items-center justify-center bg-[#F4F7FC] dark:bg-[#070A0F]">
                <ActivityIndicator size="large" color="#208AEF" />
            </View>
        );
    }

    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Protected guard={!!user} redirectTo="/login">
                <Stack.Screen name="(tabs)" />
            </Stack.Protected>

            <Stack.Protected guard={!user} redirectTo="/">
                <Stack.Screen name="(auth)" />
            </Stack.Protected>
        </Stack>
    );
}
