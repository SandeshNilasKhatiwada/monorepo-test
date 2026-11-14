import { Link } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { AuthShell } from '@/components/auth/auth-shell';
import { FormError, FormField, PrimaryButton } from '@/components/auth/form';
import { useAuth } from '@/context/AuthContext';
import { getErrorMessage } from '@/utils/errors';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_PATTERN = /^[a-zA-Z0-9_]+$/;

export default function RegisterScreen() {
    const { register } = useAuth();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    async function handleSubmit() {
        if (submitting) {
            return;
        }

        const normalizedName = name.trim();
        const normalizedEmail = email.trim();

        if (normalizedName.length < 3) {
            setError('Username must be at least 3 characters.');
            return;
        }

        if (!USERNAME_PATTERN.test(normalizedName)) {
            setError('Username can only contain letters, numbers, and underscores.');
            return;
        }

        if (!EMAIL_PATTERN.test(normalizedEmail)) {
            setError('Enter a valid email address.');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters.');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        setError(null);
        setSubmitting(true);

        try {
            await register(normalizedName, normalizedEmail, password);
        } catch (registerError) {
            setError(getErrorMessage(registerError, 'Unable to create your account. Please try again.'));
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <AuthShell
            title="Create your account"
            subtitle="A few details and you're ready to go."
            footer={
                <>
                    <Text className="text-sm text-slate-500 dark:text-slate-400">
                        Already have an account?
                    </Text>
                    <Link href="/login" asChild>
                        <Pressable hitSlop={8}>
                            <Text className="text-sm font-semibold text-brand-600 dark:text-brand-400">
                                Sign in
                            </Text>
                        </Pressable>
                    </Link>
                </>
            }
        >
            <View className="gap-5">
                <FormError message={error} />

                <FormField
                    label="Username"
                    placeholder="yourname"
                    value={name}
                    onChangeText={setName}
                    editable={!submitting}
                    autoCapitalize="none"
                    autoComplete="username"
                    textContentType="username"
                    returnKeyType="next"
                    hint="Letters, numbers, and underscores."
                />

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
                    placeholder="At least 6 characters"
                    value={password}
                    onChangeText={setPassword}
                    editable={!submitting}
                    secure
                    autoCapitalize="none"
                    autoComplete="new-password"
                    textContentType="newPassword"
                    returnKeyType="next"
                />

                <FormField
                    label="Confirm password"
                    placeholder="Repeat your password"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    editable={!submitting}
                    secure
                    autoCapitalize="none"
                    autoComplete="new-password"
                    textContentType="newPassword"
                    returnKeyType="go"
                    onSubmitEditing={handleSubmit}
                />

                <View className="pt-1">
                    <PrimaryButton
                        title="Create account"
                        loading={submitting}
                        onPress={handleSubmit}
                    />
                </View>
            </View>
        </AuthShell>
    );
}
