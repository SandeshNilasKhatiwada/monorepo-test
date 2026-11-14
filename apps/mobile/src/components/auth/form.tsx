import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import {
    ActivityIndicator,
    Pressable,
    Text,
    TextInput,
    View,
    type TextInputProps,
} from 'react-native';

import { useTheme } from '@/hooks/use-theme';

interface FormFieldProps extends TextInputProps {
    label: string;
    error?: string;
    hint?: string;
    secure?: boolean;
}

export function FormField({ label, error, hint, secure, ...props }: FormFieldProps) {
    const [focused, setFocused] = useState(false);
    const [revealed, setRevealed] = useState(false);
    const theme = useTheme();
    const { onFocus, onBlur, ...inputProps } = props;

    const borderClass = error
        ? 'border-red-400 dark:border-red-500/70'
        : focused
          ? 'border-brand-500 dark:border-brand-400'
          : 'border-slate-200 dark:border-white/10';

    return (
        <View className="gap-1.5">
            <Text className="text-sm font-semibold text-slate-700 dark:text-slate-300">{label}</Text>

            <View
                className={`h-14 flex-row items-center rounded-2xl border bg-slate-50/80 px-4 dark:bg-white/[0.04] ${borderClass}`}
            >
                <TextInput
                    className="h-full flex-1 py-0 text-base text-slate-900 dark:text-white"
                    placeholderTextColor={theme.textSecondary}
                    autoCorrect={false}
                    secureTextEntry={secure ? !revealed : false}
                    onFocus={(event) => {
                        setFocused(true);
                        onFocus?.(event);
                    }}
                    onBlur={(event) => {
                        setFocused(false);
                        onBlur?.(event);
                    }}
                    {...inputProps}
                />

                {secure ? (
                    <Pressable
                        onPress={() => setRevealed((value) => !value)}
                        hitSlop={12}
                        className="pl-3"
                        accessibilityRole="button"
                        accessibilityLabel={revealed ? 'Hide password' : 'Show password'}
                    >
                        <SymbolView
                            name={{
                                ios: revealed ? 'eye.slash.fill' : 'eye.fill',
                                android: revealed ? 'visibility_off' : 'visibility',
                                web: revealed ? 'visibility_off' : 'visibility',
                            }}
                            size={20}
                            tintColor={theme.textSecondary}
                        />
                    </Pressable>
                ) : null}
            </View>

            {error ? (
                <Text className="text-xs font-medium text-red-500">{error}</Text>
            ) : hint ? (
                <Text className="text-xs text-slate-400 dark:text-slate-500">{hint}</Text>
            ) : null}
        </View>
    );
}

export function FormError({ message }: { message: string | null }) {
    if (!message) {
        return null;
    }

    return (
        <View className="flex-row items-start gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 dark:border-red-500/30 dark:bg-red-500/10">
            <Text className="text-sm font-bold text-red-500">!</Text>
            <Text className="flex-1 text-sm leading-5 text-red-600 dark:text-red-400">{message}</Text>
        </View>
    );
}

interface PrimaryButtonProps {
    title: string;
    onPress: () => void;
    loading?: boolean;
    disabled?: boolean;
}

export function PrimaryButton({ title, onPress, loading, disabled }: PrimaryButtonProps) {
    const isDisabled = disabled || loading;

    return (
        <Pressable
            accessibilityRole="button"
            disabled={isDisabled}
            onPress={onPress}
            style={({ pressed }) => ({ opacity: pressed && !isDisabled ? 0.88 : 1 })}
            className={`h-14 w-full flex-row items-center justify-center gap-2 rounded-2xl ${
                isDisabled ? 'bg-brand-300 dark:bg-brand-800' : 'bg-brand-500'
            }`}
        >
            {loading ? <ActivityIndicator color="#ffffff" /> : null}
            <Text className="text-base font-semibold text-white">
                {loading ? 'Please wait…' : title}
            </Text>
        </Pressable>
    );
}
