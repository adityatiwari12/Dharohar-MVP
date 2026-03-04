import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Card } from '../../src/components/Card';
import { Button } from '../../src/components/Button';
import { colors } from '../../src/theme/colors';
import { spacing } from '../../src/theme/spacing';
import { typography } from '../../src/theme/typography';
import { useRouter } from 'expo-router';

export default function DashboardScreen() {
  const [role, setRole] = useState('general');
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const loadProfile = async () => {
    try {
      const r = await AsyncStorage.getItem('userRole');
      if (r) setRole(r);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      loadProfile();
      setRefreshing(false);
    }, 1000);
  }, []);

  const renderGeneralDashboard = () => (
    <View>
      <Card variant="framed" style={styles.card}>
        <Text style={styles.cardTitle}>Your Assets</Text>
        <Text style={styles.bodyText}>You have 0 assets submitted. Start digitizing your heritage today.</Text>
        <Button
          title="Upload Asset"
          onPress={() => router.push('/(tabs)/upload')}
          style={styles.actionBtn}
        />
      </Card>

      <Card variant="elevated" style={styles.card}>
        <Text style={styles.cardTitle}>My Licenses</Text>
        <Text style={styles.bodyText}>Apply for commercial licenses for physical replication of verified assets.</Text>
        <Button
          title="Apply for License"
          variant="outline"
          onPress={() => { }}
          style={styles.actionBtn}
        />
      </Card>
    </View>
  );

  const renderReviewerDashboard = () => (
    <View>
      <Card variant="framed" style={styles.card}>
        <Text style={styles.cardTitle}>Pending Reviews</Text>
        <Text style={styles.bodyText}>You have 3 assets awaiting your verification.</Text>
        <Button
          title="Review Assets"
          onPress={() => { }}
          style={styles.actionBtn}
        />
      </Card>
    </View>
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.terracotta} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Welcome back,</Text>
        <Text style={styles.roleText}>{role.charAt(0).toUpperCase() + role.slice(1)} Dashboard</Text>
      </View>

      {role === 'general' ? renderGeneralDashboard() : renderReviewerDashboard()}
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
    marginBottom: spacing.xl,
  },
  welcomeText: {
    ...typography.h1,
    marginBottom: spacing.xs,
  },
  roleText: {
    ...typography.body,
    color: colors.forest,
    fontWeight: '600',
  },
  card: {
    marginBottom: spacing.lg,
  },
  cardTitle: {
    ...typography.h3,
    marginBottom: spacing.sm,
  },
  bodyText: {
    ...typography.body,
    marginBottom: spacing.lg,
  },
  actionBtn: {
    width: '100%',
  }
});
