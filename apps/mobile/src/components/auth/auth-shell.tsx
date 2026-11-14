import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface AuthShellProps {
    title: string;
    subtitle: string;
    children: ReactNode;
    footer: ReactNode;
}

export function AuthShell({ title, subtitle, children, footer }: AuthShellProps) {
    return (
        <View className="flex-1 bg-[#F4F7FC] dark:bg-[#070A0F]">
            <View
                pointerEvents="none"
                className="absolute -left-24 -top-28 h-72 w-72 rounded-full bg-brand-300/30 dark:bg-brand-600/10"
            />
            <View
                pointerEvents="none"
                className="absolute -right-24 top-40 h-64 w-64 rounded-full border border-brand-300/40 dark:border-brand-500/15"
            />

            <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
                <KeyboardAvoidingView
                    style={{ flex: 1 }}
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                >
                    <ScrollView
                        className="flex-1"
                        contentContainerStyle={{
                            flexGrow: 1,
                            justifyContent: 'center',
                            paddingHorizontal: 24,
                            paddingVertical: 32,
                        }}
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                    >
                        <View className="w-full max-w-md self-center">
                            <View className="mb-8 items-center">
                                <View className="mb-5 h-14 w-14 items-center justify-center rounded-2xl bg-brand-500 shadow-lg">
                                    <Text className="text-2xl font-bold text-white">m</Text>
                                </View>
                                <Text className="text-center text-[32px] font-bold tracking-tight text-slate-900 dark:text-white">
                                    {title}
                                </Text>
                                <Text className="mt-2 max-w-sm text-center text-base leading-6 text-slate-500 dark:text-slate-400">
                                    {subtitle}
                                </Text>
                            </View>

                            <View className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#11151D]">
                                {children}
                            </View>

                            <View className="mt-7 flex-row flex-wrap items-center justify-center gap-1">
                                {footer}
                            </View>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </View>
    );
}
