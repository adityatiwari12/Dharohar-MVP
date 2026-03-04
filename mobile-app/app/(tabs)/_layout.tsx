import React, { useEffect, useState } from 'react';
import { Tabs, useRouter } from 'expo-router';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../../src/theme/colors';

// Simple polyfill component to avoid heavy icons for now
const TabIcon = ({ name, color, size = 24 }: { name: string; color: string; size?: number }) => {
  return null;
};

export default function TabLayout() {
  const [role, setRole] = useState('general');
  const router = useRouter();

  useEffect(() => {
    checkRole();
  }, []);

  const checkRole = async () => {
    try {
      const userRole = await AsyncStorage.getItem('userRole');
      if (userRole) setRole(userRole);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.terracotta,
        tabBarInactiveTintColor: colors.textLight,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.bgLight,
          borderTopColor: colors.mutedGold,
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 88 : 60,
          paddingBottom: Platform.OS === 'ios' ? 28 : 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontFamily: Platform.OS === 'ios' ? 'San Francisco' : 'sans-serif',
          fontWeight: '500',
        }
      }}>

      {/* Dynamic Dashboard based on User Role */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
        }}
      />

      {/* Global Explorer */}
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
        }}
      />

      {/* Asset Upload - Hidden for General roles maybe? (Visible for all for now) */}
      <Tabs.Screen
        name="upload"
        options={{
          title: 'Upload Asset',
        }}
      />

      {/* Profile/Settings */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
        }}
      />
    </Tabs>
  );
}
