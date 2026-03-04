import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { colors } from '../../src/theme/colors';
import { spacing } from '../../src/theme/spacing';
import { typography } from '../../src/theme/typography';
import { Card } from '../../src/components/Card';
import { Button } from '../../src/components/Button';

export default function ProfileScreen() {
    const router = useRouter();

    const handleLogout = async () => {
        await AsyncStorage.removeItem('userToken');
        await AsyncStorage.removeItem('userRole');
        router.replace('/(auth)/login');
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <View style={styles.header}>
                <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarText}>U</Text>
                </View>
                <Text style={styles.name}>General User</Text>
                <Text style={styles.email}>user@example.com</Text>
            </View>

            <Card variant="elevated" style={styles.section}>
                <Text style={styles.sectionTitle}>Account Settings</Text>
                <View style={styles.settingRow}>
                    <Text style={styles.settingLabel}>Edit Profile</Text>
                </View>
                <View style={styles.settingRow}>
                    <Text style={styles.settingLabel}>Change Password</Text>
                </View>
                <View style={styles.settingRow}>
                    <Text style={styles.settingLabel}>Language Preferences</Text>
                </View>
            </Card>

            <Button
                title="Sign Out"
                variant="outline"
                onPress={handleLogout}
                style={styles.logoutBtn}
            />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.parchment,
    },
    content: {
        padding: spacing.lg,
        paddingTop: spacing.xxl * 1.5,
    },
    header: {
        alignItems: 'center',
        marginBottom: spacing.xxl,
    },
    avatarPlaceholder: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: colors.terracotta,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    avatarText: {
        ...typography.h2,
        color: colors.white,
    },
    name: {
        ...typography.h2,
        marginBottom: spacing.xs,
    },
    email: {
        ...typography.body,
        color: colors.textLight,
    },
    section: {
        marginBottom: spacing.xl,
        padding: 0,
    },
    sectionTitle: {
        ...typography.h3,
        padding: spacing.lg,
        paddingBottom: spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: colors.parchment,
    },
    settingRow: {
        padding: spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: colors.parchment,
    },
    settingLabel: {
        ...typography.body,
        fontWeight: '500',
    },
    logoutBtn: {
        marginTop: spacing.md,
        borderColor: colors.danger,
    }
});
