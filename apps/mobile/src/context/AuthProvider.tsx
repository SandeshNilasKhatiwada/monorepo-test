import { useEffect, useState, type ReactNode } from 'react';
import { getTokens, saveTokens, clearTokens } from '@/utils/storage';
import { api } from '@/services/api';
import { AuthContext, type User } from './AuthContext';

interface AuthResponse {
    user: User;
    accessToken: string;
    refreshToken: string;
}

// The API returns `username` on login/me and `name` on register.
type ApiUser = User & { username?: string };

function normalizeUser(apiUser: ApiUser): User {
    return {
        id: apiUser.id,
        name: apiUser.username ?? apiUser.name,
        email: apiUser.email,
        createdAt: apiUser.createdAt,
    };
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        async function restoreSession() {
            try {
                const { accessToken } = await getTokens();
                if (!accessToken) {
                    return;
                }
                const { data } = await api.get<ApiUser>('/auth/me');
                setUser(normalizeUser(data));
            } catch (error) {
                console.error('Failed to restore session:', error);
            } finally {
                setIsLoading(false);
            }
        }
        restoreSession();
    }, []);

    const login = async (email: string, password: string) => {
        try {
            const { data } = await api.post<AuthResponse>('/auth/login', { email, password });
            await saveTokens(data.accessToken, data.refreshToken);
            setUser(normalizeUser(data.user));
        } catch (error) {
            console.error('Login failed:', error);
            throw error;
        }
    }

    const register = async (name: string, email: string, password: string) => {
        try {
            const { data } = await api.post<AuthResponse>('/auth/register', {
                username: name,
                email,
                password,
            });
            await saveTokens(data.accessToken, data.refreshToken);
            setUser(normalizeUser(data.user));
        } catch (error) {
            console.error('Registration failed:', error);
            throw error;
        }
    }

    const logout = async () => {
        // The API does not expose a logout endpoint yet, so clear the local session.
        await clearTokens();
        setUser(null);
    }

    return (
        <AuthContext.Provider
            value={{ user, isLoading, isAuthenticated: !!user, login, register, logout }}
        >
            {children}
        </AuthContext.Provider>
    );
}
