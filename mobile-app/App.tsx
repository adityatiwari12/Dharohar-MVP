import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Amplify } from 'aws-amplify';
import { Authenticator } from '@aws-amplify/ui-react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Import screens
import HomeScreen from './src/screens/HomeScreen';
import VoiceRecordingScreen from './src/screens/VoiceRecordingScreen';
import AudioHeritageScreen from './src/screens/AudioHeritageScreen';
import QRScannerScreen from './src/screens/QRScannerScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import MarketplaceScreen from './src/screens/MarketplaceScreen';

// AWS Amplify configuration
const amplifyConfig = {
  Auth: {
    Cognito: {
      region: process.env.EXPO_PUBLIC_AWS_REGION || 'us-east-1',
      userPoolId: process.env.EXPO_PUBLIC_USER_POOL_ID || '',
      userPoolClientId: process.env.EXPO_PUBLIC_USER_POOL_CLIENT_ID || '',
      identityPoolId: process.env.EXPO_PUBLIC_IDENTITY_POOL_ID || '',
    },
  },
  Storage: {
    S3: {
      bucket: process.env.EXPO_PUBLIC_S3_BUCKET || '',
      region: process.env.EXPO_PUBLIC_AWS_REGION || 'us-east-1',
    },
  },
  API: {
    REST: {
      DharoharAPI: {
        endpoint: process.env.EXPO_PUBLIC_API_GATEWAY_URL || '',
        region: process.env.EXPO_PUBLIC_AWS_REGION || 'us-east-1',
      },
    },
  },
};

Amplify.configure(amplifyConfig);

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          switch (route.name) {
            case 'Home':
              iconName = 'home';
              break;
            case 'Voice':
              iconName = 'mic';
              break;
            case 'AudioHeritage':
              iconName = 'music-note';
              break;
            case 'Scanner':
              iconName = 'qr-code-scanner';
              break;
            case 'Marketplace':
              iconName = 'store';
              break;
            case 'Profile':
              iconName = 'person';
              break;
            default:
              iconName = 'help';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#FF6B35',
        tabBarInactiveTintColor: 'gray',
        headerStyle: {
          backgroundColor: '#FF6B35',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ title: 'Dharohar' }}
      />
      <Tab.Screen 
        name="Voice" 
        component={VoiceRecordingScreen} 
        options={{ title: 'Record Knowledge' }}
      />
      <Tab.Screen 
        name="AudioHeritage" 
        component={AudioHeritageScreen} 
        options={{ title: 'Audio Heritage' }}
      />
      <Tab.Screen 
        name="Scanner" 
        component={QRScannerScreen} 
        options={{ title: 'Verify Heritage' }}
      />
      <Tab.Screen 
        name="Marketplace" 
        component={MarketplaceScreen} 
        options={{ title: 'License Assets' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ title: 'My Profile' }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <Authenticator.Provider>
      <Authenticator
        loginMechanisms={['email', 'phone_number']}
        signUpAttributes={['email', 'phone_number', 'given_name', 'family_name']}
      >
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="MainTabs" component={MainTabs} />
          </Stack.Navigator>
        </NavigationContainer>
        <StatusBar style="auto" />
      </Authenticator>
    </Authenticator.Provider>
  );
}