import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import Icon from 'react-native-vector-icons/MaterialIcons';

const QRScannerScreen: React.FC = () => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [flashOn, setFlashOn] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
    setScanned(true);
    
    // TODO: Verify Digital Passport with backend
    Alert.alert(
      'Heritage Asset Scanned',
      `QR Code: ${data}\n\nVerifying Digital Passport...`,
      [
        { text: 'View Details', onPress: () => viewAssetDetails(data) },
        { text: 'Scan Another', onPress: () => setScanned(false) },
      ]
    );
  };

  const viewAssetDetails = async (qrCode: string) => {
    // TODO: Fetch asset details from API
    Alert.alert(
      'Digital Passport Verified ✓',
      `Asset ID: ${qrCode}\n\nCreator: Meera Devi\nCommunity: Bhil Tribe\nRegion: Rajasthan\nCraft: Handloom Weaving\nAuthenticity Score: 94%\n\nCreation Story:\nThis beautiful handwoven textile was created using traditional Bhil weaving techniques passed down through generations. The intricate patterns represent local flora and fauna, with each thread carefully placed by hand using a traditional loom.`
    );
    setScanned(false);
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <Text>Requesting camera permission...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>
          Camera access is required to scan QR codes
        </Text>
        <TouchableOpacity
          style={styles.permissionButton}
          onPress={() => BarCodeScanner.requestPermissionsAsync()}
        >
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <BarCodeScanner
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        style={styles.scanner}
        flashMode={flashOn ? 'torch' : 'off'}
      >
        <View style={styles.overlay}>
          <View style={styles.header}>
            <Text style={styles.title}>Scan Heritage QR Code</Text>
            <Text style={styles.subtitle}>
              Verify authenticity and view creation story
            </Text>
          </View>

          <View style={styles.scanArea}>
            <View style={styles.scanFrame}>
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />
            </View>
            <Text style={styles.scanText}>
              Position QR code within the frame
            </Text>
          </View>

          <View style={styles.controls}>
            <TouchableOpacity
              style={styles.flashButton}
              onPress={() => setFlashOn(!flashOn)}
            >
              <Icon 
                name={flashOn ? 'flash-off' : 'flash-on'} 
                size={24} 
                color="#fff" 
              />
              <Text style={styles.flashText}>
                {flashOn ? 'Flash Off' : 'Flash On'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.infoContainer}>
            <Text style={styles.infoTitle}>What you'll see:</Text>
            <View style={styles.infoItem}>
              <Icon name="verified" size={16} color="#4CAF50" />
              <Text style={styles.infoText}>Authenticity verification</Text>
            </View>
            <View style={styles.infoItem}>
              <Icon name="person" size={16} color="#4CAF50" />
              <Text style={styles.infoText}>Creator profile and story</Text>
            </View>
            <View style={styles.infoItem}>
              <Icon name="location-on" size={16} color="#4CAF50" />
              <Text style={styles.infoText}>Origin and cultural context</Text>
            </View>
            <View style={styles.infoItem}>
              <Icon name="security" size={16} color="#4CAF50" />
              <Text style={styles.infoText}>Legal protection status</Text>
            </View>
          </View>
        </View>
      </BarCodeScanner>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanner: {
    flex: 1,
    width: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'space-between',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    opacity: 0.9,
  },
  scanArea: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  scanFrame: {
    width: 250,
    height: 250,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: '#FF6B35',
    borderWidth: 3,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  topRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  scanText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 20,
    textAlign: 'center',
  },
  controls: {
    alignItems: 'center',
    marginBottom: 20,
  },
  flashButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  flashText: {
    color: '#fff',
    fontSize: 12,
    marginTop: 4,
  },
  infoContainer: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 12,
    padding: 16,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#fff',
    marginLeft: 8,
    opacity: 0.9,
  },
  permissionText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 40,
  },
  permissionButton: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default QRScannerScreen;