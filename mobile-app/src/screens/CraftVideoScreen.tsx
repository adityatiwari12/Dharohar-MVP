import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  SafeAreaView,
} from 'react-native';
import { Camera, CameraType } from 'expo-camera';
import Icon from 'react-native-vector-icons/MaterialIcons';

const CraftVideoScreen: React.FC = () => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [cameraType, setCameraType] = useState(CameraType.back);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const cameraRef = useRef<Camera>(null);

  React.useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const startRecording = async () => {
    if (cameraRef.current) {
      try {
        setIsRecording(true);
        setRecordingDuration(0);

        // Start duration timer
        const timer = setInterval(() => {
          setRecordingDuration(prev => prev + 1);
        }, 1000);

        const video = await cameraRef.current.recordAsync({
          quality: Camera.Constants.VideoQuality['720p'],
          maxDuration: 300, // 5 minutes max
        });

        clearInterval(timer);
        setIsRecording(false);

        if (video.uri) {
          Alert.alert(
            'Video Recorded',
            `Recorded ${Math.floor(recordingDuration / 60)}:${(recordingDuration % 60).toString().padStart(2, '0')} of craft documentation.`,
            [
              { text: 'Analyze Authenticity', onPress: () => analyzeVideo(video.uri) },
              { text: 'Discard', style: 'destructive' },
            ]
          );
        }
      } catch (error) {
        console.error('Recording failed:', error);
        setIsRecording(false);
        Alert.alert('Error', 'Failed to record video. Please try again.');
      }
    }
  };

  const stopRecording = async () => {
    if (cameraRef.current && isRecording) {
      cameraRef.current.stopRecording();
    }
  };

  const analyzeVideo = async (uri: string) => {
    // TODO: Implement Amazon Rekognition analysis
    Alert.alert(
      'Analysis Started',
      'Your craft video is being analyzed for authenticity markers. The system will detect weave patterns, tool marks, and timing variations to generate an authenticity score.'
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
        <Text>Requesting camera permission...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>
          Camera access is required to document craft authenticity
        </Text>
        <TouchableOpacity
          style={styles.permissionButton}
          onPress={() => Camera.requestCameraPermissionsAsync()}
        >
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Camera
        style={styles.camera}
        type={cameraType}
        ref={cameraRef}
      >
        <View style={styles.overlay}>
          <View style={styles.header}>
            <Text style={styles.title}>Document Your Craft</Text>
            <Text style={styles.subtitle}>
              Record the creation process to prove authenticity
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
            <Text style={styles.guidelineText}>• Show your hands and tools clearly</Text>
            <Text style={styles.guidelineText}>• Capture the weaving/crafting process</Text>
            <Text style={styles.guidelineText}>• Include close-ups of patterns</Text>
            <Text style={styles.guidelineText}>• Record for at least 2-3 minutes</Text>
          </View>

          <View style={styles.controls}>
            <TouchableOpacity
              style={styles.flipButton}
              onPress={() => setCameraType(
                cameraType === CameraType.back ? CameraType.front : CameraType.back
              )}
            >
              <Icon name="flip-camera-ios" size={24} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.recordButton, isRecording && styles.recordButtonActive]}
              onPress={isRecording ? stopRecording : startRecording}
            >
              <View style={[styles.recordButtonInner, isRecording && styles.recordButtonInnerActive]} />
            </TouchableOpacity>

            <View style={styles.placeholder} />
          </View>
        </View>
      </Camera>
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
  camera: {
    flex: 1,
    width: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
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
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: 'rgba(255,0,0,0.8)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
    marginRight: 8,
  },
  recordingText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  guidelines: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  guidelinesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  guidelineText: {
    fontSize: 14,
    color: '#fff',
    marginBottom: 4,
    opacity: 0.9,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 20,
  },
  flipButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordButtonActive: {
    backgroundColor: '#FF6B35',
  },
  recordButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FF6B35',
  },
  recordButtonInnerActive: {
    width: 30,
    height: 30,
    borderRadius: 4,
    backgroundColor: '#fff',
  },
  placeholder: {
    width: 50,
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

export default CraftVideoScreen;