import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Button } from '../../src/components/Button';
import { Input } from '../../src/components/Input';
import { colors } from '../../src/theme/colors';
import { spacing } from '../../src/theme/spacing';
import { typography } from '../../src/theme/typography';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async () => {
        if (!email || !password) {
            setError('Please fill in all fields');
            return;
        }

        setLoading(true);
        setError('');

        // In a real app, this would be an API call
        try {
            // Simulate API call
            setTimeout(async () => {
                // Mock token logic for now to allow seamless dev
                await AsyncStorage.setItem('userToken', 'dummy-token');
                await AsyncStorage.setItem('userRole', 'general'); // General user default
                setLoading(false);
                router.replace('/(tabs)');
            }, 1000);
        } catch (err) {
            setError('Login failed. Please check your credentials.');
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.headerContainer}>
                    <Text style={styles.title}>DHAROHAR</Text>
                    <Text style={styles.subtitle}>Preserving Cultural Heritage</Text>
                </View>

                <View style={styles.formContainer}>
                    <Text style={styles.loginTitle}>Welcome Back</Text>

                    {error ? <Text style={styles.errorText}>{error}</Text> : null}

                    <Input
                        label="Email Address"
                        placeholder="Enter your email"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />

                    <Input
                        label="Password"
                        placeholder="Enter your password"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                    />

                    <View style={styles.buttonContainer}>
                        <Button
                            title="Sign In"
                            onPress={handleLogin}
                            isLoading={loading}
                            style={{ width: '100%' }}
                        />
                    </View>

                    <Button
                        title="Create an Account"
                        variant="ghost"
                        onPress={() => router.push('/(auth)/register')}
                    />
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.parchment,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: spacing.xl,
    },
    headerContainer: {
        alignItems: 'center',
        marginBottom: spacing.xxl,
    },
    title: {
        ...typography.h1,
        fontSize: 32,
        letterSpacing: 2,
    },
    subtitle: {
        ...typography.body,
        color: colors.forest,
        marginTop: spacing.xs,
    },
    formContainer: {
        backgroundColor: colors.bgLight,
        padding: spacing.xl,
        borderRadius: 8,
        shadowColor: colors.textMain,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 3,
    },
    loginTitle: {
        ...typography.h2,
        marginBottom: spacing.lg,
        textAlign: 'center',
    },
    buttonContainer: {
        marginTop: spacing.md,
        marginBottom: spacing.md,
    },
    errorText: {
        ...typography.bodySmall,
        color: colors.danger,
        marginBottom: spacing.md,
        textAlign: 'center',
    },
});
