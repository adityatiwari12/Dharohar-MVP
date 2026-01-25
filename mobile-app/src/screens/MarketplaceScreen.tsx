import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const MarketplaceScreen: React.FC = () => {
  const assets = [
    {
      id: '1',
      title: 'Traditional Turmeric Remedy',
      creator: 'Kamala Devi',
      community: 'Bhil Tribe',
      region: 'Rajasthan',
      type: 'Medicinal Knowledge',
      price: '₹5,000',
      authenticity: 96,
      description: 'Ancient turmeric-based remedy for joint pain, documented with botanical mapping',
    },
    {
      id: '2',
      title: 'Handloom Weaving Pattern',
      creator: 'Meera Sharma',
      community: 'Kota Doria',
      region: 'Rajasthan',
      type: 'Craft Technique',
      price: '₹15,000',
      authenticity: 94,
      description: 'Traditional Kota Doria weaving pattern with 200+ year heritage',
    },
    {
      id: '3',
      title: 'Neem-based Pesticide Formula',
      creator: 'Ravi Patel',
      community: 'Gujarati Farmers',
      region: 'Gujarat',
      type: 'Agricultural Knowledge',
      price: '₹8,000',
      authenticity: 98,
      description: 'Organic pesticide formula using neem and other local plants',
    },
  ];

  const licenseTypes = [
    { name: 'Research License', description: 'Academic research only', icon: 'school' },
    { name: 'Commercial License', description: 'Commercial use rights', icon: 'business' },
    { name: 'Exclusive License', description: 'Exclusive usage rights', icon: 'star' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Heritage Marketplace</Text>
          <Text style={styles.subtitle}>
            License traditional knowledge ethically and support communities
          </Text>
        </View>

        <View style={styles.licenseTypesContainer}>
          <Text style={styles.sectionTitle}>License Types</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {licenseTypes.map((type, index) => (
              <View key={index} style={styles.licenseTypeCard}>
                <Icon name={type.icon} size={24} color="#FF6B35" />
                <Text style={styles.licenseTypeName}>{type.name}</Text>
                <Text style={styles.licenseTypeDescription}>{type.description}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        <View style={styles.assetsContainer}>
          <Text style={styles.sectionTitle}>Available Heritage Assets</Text>
          {assets.map((asset) => (
            <TouchableOpacity key={asset.id} style={styles.assetCard}>
              <View style={styles.assetHeader}>
                <View style={styles.assetInfo}>
                  <Text style={styles.assetTitle}>{asset.title}</Text>
                  <Text style={styles.assetType}>{asset.type}</Text>
                </View>
                <View style={styles.priceContainer}>
                  <Text style={styles.price}>{asset.price}</Text>
                  <Text style={styles.priceLabel}>Starting from</Text>
                </View>
              </View>

              <Text style={styles.assetDescription}>{asset.description}</Text>

              <View style={styles.assetDetails}>
                <View style={styles.creatorInfo}>
                  <Icon name="person" size={16} color="#666" />
                  <Text style={styles.creatorText}>{asset.creator}</Text>
                </View>
                <View style={styles.locationInfo}>
                  <Icon name="location-on" size={16} color="#666" />
                  <Text style={styles.locationText}>{asset.community}, {asset.region}</Text>
                </View>
              </View>

              <View style={styles.assetFooter}>
                <View style={styles.authenticityContainer}>
                  <Icon name="verified" size={16} color="#4CAF50" />
                  <Text style={styles.authenticityText}>{asset.authenticity}% Authentic</Text>
                </View>
                <TouchableOpacity style={styles.licenseButton}>
                  <Text style={styles.licenseButtonText}>License Now</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.impactContainer}>
          <Text style={styles.impactTitle}>Your Impact</Text>
          <Text style={styles.impactDescription}>
            80% of license fees go directly to heritage creators and their communities.
            Your purchase helps preserve traditional knowledge and supports rural livelihoods.
          </Text>
          <View style={styles.impactStats}>
            <View style={styles.impactStat}>
              <Text style={styles.impactNumber}>₹2.5L</Text>
              <Text style={styles.impactLabel}>Paid to Creators</Text>
            </View>
            <View style={styles.impactStat}>
              <Text style={styles.impactNumber}>150+</Text>
              <Text style={styles.impactLabel}>Families Supported</Text>
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
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  licenseTypesContainer: {
    marginBottom: 30,
  },
  licenseTypeCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    width: 140,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  licenseTypeName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginTop: 8,
    textAlign: 'center',
  },
  licenseTypeDescription: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  assetsContainer: {
    marginBottom: 30,
  },
  assetCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  assetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  assetInfo: {
    flex: 1,
  },
  assetTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  assetType: {
    fontSize: 14,
    color: '#FF6B35',
    fontWeight: '500',
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  priceLabel: {
    fontSize: 12,
    color: '#666',
  },
  assetDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  assetDetails: {
    marginBottom: 12,
  },
  creatorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  creatorText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
  },
  assetFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  authenticityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authenticityText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
    marginLeft: 4,
  },
  licenseButton: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  licenseButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  impactContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  impactTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  impactDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 16,
  },
  impactStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  impactStat: {
    alignItems: 'center',
  },
  impactNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6B35',
    marginBottom: 4,
  },
  impactLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});

export default MarketplaceScreen;