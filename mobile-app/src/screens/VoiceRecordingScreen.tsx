import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  SafeAreaView,
} from 'react-native';
import { Audio } from 'expo-av';
import * as Location from 'expo-location';
import Icon from 'react-native-vector-icons/MaterialIcons';

const VoiceRecordingScreen: React.FC = () => {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);

  useEffect(() => {
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    try {
      const audioPermission = await Audio.requestPermissionsAsync();
      const locationPermission = await Location.requestForegroundPermissionsAsync();
      
      if (audioPermission.status !== 'granted') {
        Alert.alert('Permission Required', 'Audio recording permission is required to document traditional knowledge.');
      }
      
      if (locationPermission.status !== 'granted') {
        Alert.alert('Permission Required', 'Location permission is required to tag heritage assets with GPS coordinates.');
      }
    } catch (error) {
      console.error('Error requesting permissions:', error);
    }
  };

  const startRecording = async () => {
    try {
      // Get current location
      const currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);

      // Configure audio recording
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecording(newRecording);
      setIsRecording(true);
      setRecordingDuration(0);

      // Start duration timer
      const timer = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);

      // Store timer reference for cleanup
      (newRecording as any).timer = timer;

    } catch (error) {
      console.error('Failed to start recording:', error);
      Alert.alert('Error', 'Failed to start recording. Please try again.');
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    try {
      setIsRecording(false);
      
      // Clear timer
      if ((recording as any).timer) {
        clearInterval((recording as any).timer);
      }

      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      
      if (uri) {
        // Here you would upload to S3 and process with AWS Bedrock
        Alert.alert(
          'Recording Complete',
          `Recorded ${Math.floor(recordingDuration / 60)}:${(recordingDuration % 60).toString().padStart(2, '0')} of traditional knowledge.\n\nLocation: ${location?.coords.latitude.toFixed(6)}, ${location?.coords.longitude.toFixed(6)}`,
          [
            { text: 'Save & Process', onPress: () => processRecording(uri) },
            { text: 'Discard', style: 'destructive' },
          ]
        );
      }

      setRecording(null);
      setRecordingDuration(0);
    } catch (error) {
      console.error('Failed to stop recording:', error);
      Alert.alert('Error', 'Failed to stop recording. Please try again.');
    }
  };

  const processRecording = async (uri: string) => {
    // TODO: Implement AWS Bedrock processing
    Alert.alert(
      'Processing Started',
      'Your traditional knowledge is being transcribed and mapped to botanical taxonomy. You will be notified when the Prior Art Dossier is ready.'
    );
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Record Traditional Knowledge</Text>
          <Text style={styles.subtitle}>
            Document oral remedies and traditional practices in your native dialect
          </Text>
        </View>

        <View style={styles.recordingContainer}>
          <View style={[styles.recordingCircle, isRecording && styles.recordingActive]}>
            <TouchableOpacity
              style={[styles.recordButton, isRecording && styles.recordButtonActive]}
              onPress={isRecording ? stopRecording : startRecording}
            >
              <Icon 
                name={isRecording ? 'stop' : 'mic'} 
                size={48} 
                color={isRecording ? '#fff' : '#FF6B35'} 
              />
            </TouchableOpacity>
          </View>

          {isRecording && (
            <View style={styles.recordingInfo}>
              <Text style={styles.recordingText}>Recording...</Text>
              <Text style={styles.durationText}>{formatDuration(recordingDuration)}</Text>
            </View>
          )}
        </View>

        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionsTitle}>Recording Tips:</Text>
          <View style={styles.instruction}>
            <Icon name="volume-up" size={20} color="#4CAF50" />
            <Text style={styles.instructionText}>Speak clearly in your native dialect</Text>
          </View>
          <View style={styles.instruction}>
            <Icon name="nature" size={20} color="#4CAF50" />
            <Text style={styles.instructionText}>Mention plant names and their uses</Text>
          </View>
          <View style={styles.instruction}>
            <Icon name="location-on" size={20} color="#4CAF50" />
            <Text style={styles.instructionText}>Location will be automatically tagged</Text>
          </View>
          <View style={styles.instruction}>
            <Icon name="security" size={20} color="#4CAF50" />
            <Text style={styles.instructionText}>Your knowledge will be legally protected</Text>
          </View>
        </View>

        {location && (
          <View style={styles.locationContainer}>
            <Icon name="location-on" size={16} color="#666" />
            <Text style={styles.locationText}>
              {location.coords.latitude.toFixed(6)}, {location.coords.longitude.toFixed(6)}
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
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
  recordingContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  recordingCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    marginBottom: 20,
  },
  recordingActive: {
    backgroundColor: '#FF6B35',
  },
  recordButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  recordButtonActive: {
    backgroundColor: '#D32F2F',
  },
  recordingInfo: {
    alignItems: 'center',
  },
  recordingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FF6B35',
    marginBottom: 4,
  },
  durationText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  instructionsContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: 20,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  instruction: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  instructionText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 12,
    flex: 1,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
});

export default VoiceRecordingScreen;