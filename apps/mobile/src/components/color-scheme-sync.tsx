import { useEffect } from 'react';
import { Platform } from 'react-native';

/**
 * NativeWind's web runtime needs the `dark` class on <html> when
 * Tailwind is configured with `darkMode: 'class'`. Native platforms
 * follow the system appearance through NativeWind automatically.
 */
export function ColorSchemeSync() {
    useEffect(() => {
        if (Platform.OS !== 'web' || typeof window === 'undefined') {
            return;
        }

        const media = window.matchMedia('(prefers-color-scheme: dark)');
        const apply = () => {
            document.documentElement.classList.toggle('dark', media.matches);
        };

        apply();
        media.addEventListener('change', apply);

        return () => media.removeEventListener('change', apply);
    }, []);

    return null;
}
