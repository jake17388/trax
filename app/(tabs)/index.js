export const unstable_settings = { ssr: false };

import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import TraxMap from '../../src/components/TraxMap';
import { useLocation } from '../../src/hooks/useLocation';
import { getTracks, saveTrack } from '../../src/services/storage';
import { getProfile } from '../../src/services/profile';
import { supabase } from '../../src/lib/supabase';
import { colors, spacing, fontSizes } from '../../src/constants/theme';

export default function MapScreen() {
  const { location, error } = useLocation();
  const [tracks, setTracks] = useState([]);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    (async () => setTracks(await getTracks()))();
  }, []);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const profile = await getProfile(user.id);
      if (profile?.name) setUserName(profile.name);
    })();
  }, []);

  async function dropTrack() {
    if (!location) {
      Alert.alert('No location', 'Still waiting for your location…');
      return;
    }
    const track = {
      id: Date.now().toString(),
      title: `Track — ${new Date().toLocaleDateString()}`,
      coordinate: { latitude: location.latitude, longitude: location.longitude },
      createdAt: new Date().toISOString(),
    };
    await saveTrack(track);
    setTracks((prev) => [...prev, track]);
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TraxMap tracks={[]} userLocation={null} />

      <View style={styles.greeting}>
        <Text style={styles.greetingText}>
          {userName ? `Hello, ${userName}` : 'Hello'}
        </Text>
      </View>

      <TouchableOpacity style={styles.fab} onPress={dropTrack}>
        <Text style={styles.fabText}>+ Drop Track</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
  errorText: { fontSize: fontSizes.md, color: colors.accent, textAlign: 'center' },
  greeting: {
    position: 'absolute',
    top: 56,
    left: spacing.lg,
    right: spacing.lg,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  greetingText: {
    fontSize: fontSizes.lg,
    fontWeight: '700',
    color: colors.primary,
  },
  fab: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 28,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  fabText: { color: '#fff', fontSize: fontSizes.md, fontWeight: '600' },
});
