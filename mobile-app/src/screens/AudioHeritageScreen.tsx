import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { Audio } from 'expo-av';
import Icon from 'react-native-vector-icons/MaterialIcons';

const AudioHeritageScreen: React.FC = () => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  React.useEffect(() => {
    (async () => {
      const { status } = await Audio.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const startRecording = async () => {
    try {
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
      timerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Failed to start recording:', error);
      Alert.alert('Error', 'Failed to start recording. Please try again.');
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    try {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);
      setIsRecording(false);

      if (uri) {
        Alert.alert(
          'Audio Recorded',
          `Recorded ${formatDuration(recordingDuration)} of audio heritage.`,
          [
            { text: 'Transcribe & Archive', onPress: () => processAudio(uri) },
            { text: 'Discard', style: 'destructive' },
          ]
        );
      }
    } catch (error) {
      console.error('Failed to stop recording:', error);
      Alert.alert('Error', 'Failed to stop recording.');
    }
  };

  const processAudio = async (uri: string) => {
    // TODO: Implement AWS Bedrock transcription and cultural archiving
    Alert.alert(
      'Processing Started',
      'Your audio heritage is being transcribed and analyzed. The system will extract cultural context and create a UNESCO-compliant archive.'
    );
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <Text>Requesting microphone permission...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>
          Microphone access is required to record audio heritage
        </Text>
        <TouchableOpacity
          style={styles.permissionButton}
          onPress={() => Audio.requestPermissionsAsync()}
        >
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Icon name="music-note" size={60} color="#FF6B35" />
          <Text style={styles.title}>Audio Heritage Recording</Text>
          <Text style={styles.subtitle}>
            Preserve traditional music, folk songs, and oral stories
          </Text>
        </View>

        {isRecording && (
          <View style={styles.recordingIndicator}>
            <View style={styles.recordingDot} />
            <Text style={styles.recordingText}>REC {formatDuration(recordingDuration)}</Text>
          </View>
        )}

        <View style={styles.guidelines}>
          <Text style={styles.guidelinesTitle}>Recording Guidelines:</Text>
          <Text style={styles.guidelineText}>🎵 Find a quiet location</Text>
          <Text style={styles.guidelineText}>🎤 Speak or sing clearly</Text>
          <Text style={styles.guidelineText}>📖 Include cultural context</Text>
          <Text style={styles.guidelineText}>⏱️ Record complete songs/stories</Text>
          <Text style={styles.guidelineText}>🌍 Mention region and tradition</Text>
        </View>

        <View style={styles.examplesSection}>
          <Text style={styles.examplesTitle}>What to Record:</Text>
          <View style={styles.exampleCard}>
            <Icon name="library-music" size={24} color="#FF6B35" />
            <Text style={styles.exampleText}>Folk Songs & Traditional Music</Text>
          </View>
          <View style={styles.exampleCard}>
            <Icon name="record-voice-over" size={24} color="#FF6B35" />
            <Text style={styles.exampleText}>Oral Stories & Legends</Text>
          </View>
          <View style={styles.exampleCard}>
            <Icon name="celebration" size={24} color="#FF6B35" />
            <Text style={styles.exampleText}>Ritual Chants & Ceremonies</Text>
          </View>
          <View style={styles.exampleCard}>
            <Icon name="history-edu" size={24} color="#FF6B35" />
            <Text style={styles.exampleText}>Historical Narratives</Text>
          </View>
        </View>

        <View style={styles.controls}>
          <TouchableOpacity
            style={[styles.recordButton, isRecording && styles.recordButtonActive]}
            onPress={isRecording ? stopRecording : startRecording}
          >
            <Icon 
              name={isRecording ? 'stop' : 'mic'} 
              size={40} 
              color="#fff" 
            />
          </TouchableOpacity>
          <Text style={styles.recordButtonLabel}>
            {isRecording ? 'Stop Recording' : 'Start Recording'}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    padding: 20,
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF6B35',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 20,
  },
  recordingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#fff',
    marginRight: 8,
  },
  recordingText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  guidelines: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  guidelinesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  guidelineText: {
    fontSize: 15,
    color: '#666',
    marginBottom: 8,
    lineHeight: 22,
  },
  examplesSection: {
    width: '100%',
    marginBottom: 30,
  },
  examplesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  exampleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  exampleText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
    flex: 1,
  },
  controls: {
    alignItems: 'center',
    marginTop: 20,
  },
  recordButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FF6B35',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  recordButtonActive: {
    backgroundColor: '#E63946',
  },
  recordButtonLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 12,
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

export default AudioHeritageScreen;
