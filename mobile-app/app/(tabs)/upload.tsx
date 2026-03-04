import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { colors } from '../../src/theme/colors';
import { spacing, layout } from '../../src/theme/spacing';
import { typography } from '../../src/theme/typography';
import { Button } from '../../src/components/Button';
import { Input } from '../../src/components/Input';
import { Card } from '../../src/components/Card';
import { useRouter } from 'expo-router';

type SubmissionType = 'BIO' | 'SONIC' | null;

export default function UploadScreen() {
    const [step, setStep] = useState(1);
    const [type, setType] = useState<SubmissionType>(null);
    const [formData, setFormData] = useState({
        title: '',
        community: '',
        description: '',
        category: 'MEDICINAL',
        riskTier: 'LOW',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();

    const handleTypeSelect = (selectedType: SubmissionType) => {
        setType(selectedType);
        setStep(2);
    };

    const submitForm = () => {
        setIsSubmitting(true);
        setTimeout(() => {
            setIsSubmitting(false);
            setStep(3); // success view
        }, 1500);
    };

    if (step === 3) {
        return (
            <View style={[styles.container, styles.centered]}>
                <Card variant="framed" style={{ width: '90%', alignItems: 'center' }}>
                    <Text style={[styles.title, { color: colors.success, marginBottom: spacing.md }]}>Submission Successful</Text>
                    <Text style={styles.bodyText}>Your archival record has been timestamped and encrypted. It is now pending institutional review.</Text>
                    <Button
                        title="View My Submissions"
                        onPress={() => {
                            setStep(1);
                            setType(null);
                            router.push('/(tabs)');
                        }}
                        style={{ marginTop: spacing.xl, width: '100%' }}
                    />
                </Card>
            </View>
        );
    }

    if (step === 1) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>Archival Initiation</Text>
                    <Text style={styles.subtitle}>Select the structure of the cultural knowledge you wish to preserve.</Text>
                </View>

                <View style={styles.selectionGrid}>
                    <TouchableOpacity
                        style={styles.selectionCard}
                        activeOpacity={0.8}
                        onPress={() => handleTypeSelect('BIO')}
                    >
                        <Text style={styles.cardTitle}>DHAROHAR-BIO</Text>
                        <Text style={styles.cardDesc}>Biological knowledge, medicinal practices, agricultural techniques, and ecological wisdom.</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.selectionCard}
                        activeOpacity={0.8}
                        onPress={() => handleTypeSelect('SONIC')}
                    >
                        <Text style={styles.cardTitle}>DHAROHAR-SONIC</Text>
                        <Text style={styles.cardDesc}>Musical archives, ritual chants, oral histories, and performance media.</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <ScrollView contentContainerStyle={styles.scrollForm}>
                <Button
                    title="← Back to Selection"
                    variant="ghost"
                    onPress={() => setStep(1)}
                    style={styles.backButton}
                />

                <Text style={styles.formTitle}>New {type} Archive</Text>

                <View style={styles.formGroup}>
                    <Input
                        label="Asset Title"
                        placeholder="e.g. Monsoon Chants"
                        value={formData.title}
                        onChangeText={(t) => setFormData({ ...formData, title: t })}
                    />
                    <Input
                        label="Community Origin"
                        placeholder="e.g. Warli Tribe"
                        value={formData.community}
                        onChangeText={(t) => setFormData({ ...formData, community: t })}
                    />

                    <Text style={styles.label}>Detailed Description</Text>
                    <TextInput
                        style={styles.textArea}
                        multiline
                        numberOfLines={4}
                        placeholder="Detailed historical context..."
                        placeholderTextColor={colors.textLight}
                        value={formData.description}
                        onChangeText={(t) => setFormData({ ...formData, description: t })}
                        textAlignVertical="top"
                    />

                    <View style={styles.mediaPlaceholder}>
                        <Text style={styles.mediaText}>Upload or Record Media</Text>
                        <Text style={styles.mediaSubtext}>(Simulation for now - taps will request camera permissions)</Text>
                        <Button title="Mock Attach Media" variant="outline" onPress={() => { }} style={{ marginTop: spacing.sm }} />
                    </View>
                </View>

                <Button
                    title="Finalize Governance Submission"
                    onPress={submitForm}
                    isLoading={isSubmitting}
                    style={{ marginTop: spacing.lg }}
                />
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.parchment,
    },
    centered: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        padding: spacing.xl,
        paddingTop: spacing.xxl * 1.5,
        alignItems: 'center',
    },
    title: {
        ...typography.h2,
        textAlign: 'center',
        marginBottom: spacing.sm,
    },
    subtitle: {
        ...typography.body,
        textAlign: 'center',
        color: colors.textLight,
    },
    selectionGrid: {
        padding: spacing.lg,
        gap: spacing.md,
    },
    selectionCard: {
        backgroundColor: colors.bgLight,
        padding: spacing.xl,
        borderRadius: layout.borderRadius,
        ...layout.shadowSoft,
        borderWidth: 1,
        borderColor: colors.mutedGold,
    },
    cardTitle: {
        ...typography.h3,
        marginBottom: spacing.sm,
    },
    cardDesc: {
        ...typography.body,
        color: colors.textLight,
    },
    scrollForm: {
        padding: spacing.lg,
        paddingTop: spacing.xl,
        paddingBottom: spacing.xxl * 2,
    },
    backButton: {
        alignSelf: 'flex-start',
        marginBottom: spacing.md,
        paddingHorizontal: 0,
    },
    formTitle: {
        ...typography.h2,
        marginBottom: spacing.lg,
    },
    formGroup: {
        backgroundColor: colors.bgLight,
        padding: spacing.lg,
        borderRadius: layout.borderRadius,
        ...layout.shadowSoft,
    },
    label: {
        ...typography.bodySmall,
        fontWeight: '600',
        color: colors.burntUmber,
        marginBottom: spacing.xs,
    },
    textArea: {
        ...typography.body,
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.mutedGold,
        borderRadius: layout.borderRadius,
        padding: spacing.md,
        minHeight: 120,
        color: colors.textMain,
        marginBottom: spacing.md,
    },
    mediaPlaceholder: {
        borderWidth: 1,
        borderColor: colors.mutedGold,
        borderStyle: 'dashed',
        borderRadius: layout.borderRadius,
        padding: spacing.xl,
        alignItems: 'center',
        marginTop: spacing.sm,
    },
    mediaText: {
        ...typography.button,
        color: colors.forest,
    },
    mediaSubtext: {
        ...typography.bodySmall,
        textAlign: 'center',
        marginTop: spacing.xs,
    },
    bodyText: {
        ...typography.body,
        textAlign: 'center',
    }
});
