import { Link } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { AuthShell } from '@/components/auth/auth-shell';
import { FormError, FormField, PrimaryButton } from '@/components/auth/form';
import { useAuth } from '@/context/AuthContext';
import { getErrorMessage } from '@/utils/errors';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginScreen() {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    async function handleSubmit() {
        if (submitting) {
            return;
        }

        const normalizedEmail = email.trim();

        if (!EMAIL_PATTERN.test(normalizedEmail)) {
            setError('Enter a valid email address.');
            return;
        }

        if (!password) {
            setError('Enter your password.');
            return;
        }

        setError(null);
        setSubmitting(true);

        try {
            await login(normalizedEmail, password);
        } catch (loginError) {
            setError(getErrorMessage(loginError, 'Unable to sign in. Please try again.'));
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <AuthShell
            title="Welcome back"
            subtitle="Sign in to continue to your account."
            footer={
                <>
                    <Text className="text-sm text-slate-500 dark:text-slate-400">New here?</Text>
                    <Link href="/register" asChild>
                        <Pressable hitSlop={8}>
                            <Text className="text-sm font-semibold text-brand-600 dark:text-brand-400">
                                Create an account
                            </Text>
                        </Pressable>
                    </Link>
                </>
            }
        >
            <View className="gap-5">
                <FormError message={error} />

                <FormField
                    label="Email"
                    placeholder="you@example.com"
                    value={email}
                    onChangeText={setEmail}
                    editable={!submitting}
                    keyboardType="email-address"
                    inputMode="email"
                    autoCapitalize="none"
                    autoComplete="email"
                    textContentType="emailAddress"
                    returnKeyType="next"
                />

                <FormField
                    label="Password"
                    placeholder="Enter your password"
                    value={password}
                    onChangeText={setPassword}
                    editable={!submitting}
                    secure
                    autoCapitalize="none"
                    autoComplete="current-password"
                    textContentType="password"
                    returnKeyType="go"
                    onSubmitEditing={handleSubmit}
                />

                <View className="pt-1">
                    <PrimaryButton title="Sign in" loading={submitting} onPress={handleSubmit} />
                </View>
            </View>
        </AuthShell>
    );
}
