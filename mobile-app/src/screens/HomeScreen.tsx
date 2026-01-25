import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const HomeScreen: React.FC = () => {
  const navigation = useNavigation();

  const features = [
    {
      title: 'Record Traditional Knowledge',
      description: 'Document oral remedies and traditional practices',
      icon: 'mic',
      screen: 'Voice',
      color: '#4CAF50',
    },
    {
      title: 'Authenticate Handicrafts',
      description: 'Verify authenticity of handmade products',
      icon: 'videocam',
      screen: 'Craft',
      color: '#2196F3',
    },
    {
      title: 'Scan Heritage Assets',
      description: 'Verify Digital Passports with QR codes',
      icon: 'qr-code-scanner',
      screen: 'Scanner',
      color: '#FF9800',
    },
    {
      title: 'Browse Marketplace',
      description: 'License heritage assets for research',
      icon: 'store',
      screen: 'Marketplace',
      color: '#9C27B0',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Welcome to Dharohar</Text>
          <Text style={styles.subtitle}>
            Protecting and monetizing India's cultural heritage
          </Text>
        </View>

        <View style={styles.featuresContainer}>
          {features.map((feature, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.featureCard, { borderLeftColor: feature.color }]}
              onPress={() => navigation.navigate(feature.screen as never)}
            >
              <View style={styles.featureContent}>
                <View style={[styles.iconContainer, { backgroundColor: feature.color }]}>
                  <Icon name={feature.icon} size={24} color="#fff" />
                </View>
                <View style={styles.featureText}>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureDescription}>{feature.description}</Text>
                </View>
                <Icon name="chevron-right" size={24} color="#ccc" />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.statsContainer}>
          <Text style={styles.statsTitle}>Platform Impact</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>10K+</Text>
              <Text style={styles.statLabel}>Heritage Creators</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>₹100Cr</Text>
              <Text style={styles.statLabel}>Community Revenue</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>50K+</Text>
              <Text style={styles.statLabel}>Practices Documented</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>1K+</Text>
              <Text style={styles.statLabel}>Legal Protections</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    marginBottom: 30,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  featuresContainer: {
    marginBottom: 30,
  },
  featureCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  featureContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  statsContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statsTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 16,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6B35',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});

export default HomeScreen;