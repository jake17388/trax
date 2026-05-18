import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import TraxMap from '../../src/components/TraxMap';
import { useLocation } from '../../src/hooks/useLocation';
import { getTracks, saveTrack } from '../../src/services/storage';
import { colors, spacing, fontSizes } from '../../src/constants/theme';

export default function MapScreen() {
  const { location, error } = useLocation();
  const [tracks, setTracks] = useState([]);

  useEffect(() => {
    (async () => setTracks(await getTracks()))();
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
      <TraxMap tracks={tracks} userLocation={location} />
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
