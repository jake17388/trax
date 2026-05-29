import { Tabs } from 'expo-router';
import { colors } from '../../src/constants/theme';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: { borderTopColor: '#E5E5EA' },
      }}
    >
      <Tabs.Screen name="index"    options={{ title: 'Map' }} />
      <Tabs.Screen name="events"   options={{ title: 'Events' }} />
      <Tabs.Screen name="settings" options={{ title: 'Settings' }} />
      {/* Hide old tracks tab from the tab bar */}
      <Tabs.Screen name="tracks"   options={{ href: null }} />
    </Tabs>
  );
}
