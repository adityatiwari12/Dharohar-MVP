import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useAuthenticator } from '@aws-amplify/ui-react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const ProfileScreen: React.FC = () => {
  const { user, signOut } = useAuthenticator();

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', onPress: signOut, style: 'destructive' },
      ]
    );
  };

  const profileStats = [
    { label: 'Assets Created', value: '12', icon: 'inventory' },
    { label: 'Revenue Earned', value: '₹45,000', icon: 'account-balance-wallet' },
    { label: 'Authenticity Score', value: '96%', icon: 'verified' },
    { label: 'Community Rank', value: '#3', icon: 'star' },
  ];

  const menuItems = [
    { title: 'My Heritage Assets', icon: 'inventory', action: () => {} },
    { title: 'Revenue & Payments', icon: 'payment', action: () => {} },
    { title: 'Verification Status', icon: 'verified-user', action: () => {} },
    { title: 'Community Settings', icon: 'group', action: () => {} },
    { title: 'Legal Documents', icon: 'description', action: () => {} },
    { title: 'Help & Support', icon: 'help', action: () => {} },
    { title: 'Privacy Settings', icon: 'privacy-tip', action: () => {} },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <Icon name="person" size={48} color="#fff" />
          </View>
          <Text style={styles.userName}>
            {user?.attributes?.given_name} {user?.attributes?.family_name}
          </Text>
          <Text style={styles.userEmail}>{user?.attributes?.email}</Text>
          <View style={styles.userBadge}>
            <Icon name="verified" size={16} color="#4CAF50" />
            <Text style={styles.badgeText}>Verified Heritage Creator</Text>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>Your Impact</Text>
          <View style={styles.statsGrid}>
            {profileStats.map((stat, index) => (
              <View key={index} style={styles.statCard}>
                <Icon name={stat.icon} size={24} color="#FF6B35" />
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.menuContainer}>
          <Text style={styles.sectionTitle}>Account Settings</Text>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={item.action}
            >
              <View style={styles.menuItemContent}>
                <Icon name={item.icon} size={24} color="#666" />
                <Text style={styles.menuItemText}>{item.title}</Text>
              </View>
              <Icon name="chevron-right" size={24} color="#ccc" />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.communityContainer}>
          <Text style={styles.sectionTitle}>Community Information</Text>
          <View style={styles.communityCard}>
            <View style={styles.communityInfo}>
              <Icon name="location-on" size={20} color="#666" />
              <Text style={styles.communityText}>Bhil Tribe, Rajasthan</Text>
            </View>
            <View style={styles.communityInfo}>
              <Icon name="work" size={20} color="#666" />
              <Text style={styles.communityText}>Traditional Healer & Weaver</Text>
            </View>
            <View style={styles.communityInfo}>
              <Icon name="language" size={20} color="#666" />
              <Text style={styles.communityText}>Bhili, Hindi, English</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Icon name="logout" size={20} color="#fff" />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
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
    alignItems: 'center',
    marginBottom: 30,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FF6B35',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: '#666',
    marginBottom: 12,
  },
  userBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  badgeText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
    marginLeft: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  statsContainer: {
    marginBottom: 30,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    width: '48%',
    alignItems: 'center',
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  menuContainer: {
    marginBottom: 30,
  },
  menuItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  communityContainer: {
    marginBottom: 30,
  },
  communityCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  communityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  communityText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  signOutButton: {
    backgroundColor: '#FF6B35',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  signOutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default ProfileScreen;