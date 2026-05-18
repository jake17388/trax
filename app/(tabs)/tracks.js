import { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { getTracks, deleteTrack } from '../../src/services/storage';
import { colors, spacing, fontSizes } from '../../src/constants/theme';

export default function TracksScreen() {
  const [tracks, setTracks] = useState([]);

  useFocusEffect(
    useCallback(() => {
      (async () => setTracks(await getTracks()))();
    }, [])
  );

  function confirmDelete(id) {
    Alert.alert('Delete Track', 'Remove this track?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteTrack(id);
          setTracks((prev) => prev.filter((t) => t.id !== id));
        },
      },
    ]);
  }

  if (tracks.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>No tracks yet.</Text>
        <Text style={styles.emptyHint}>Drop one on the map!</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={[...tracks].reverse()}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <View style={styles.cardContent}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.coords}>
              {item.coordinate.latitude.toFixed(5)}, {item.coordinate.longitude.toFixed(5)}
            </Text>
            <Text style={styles.date}>{new Date(item.createdAt).toLocaleString()}</Text>
          </View>
          <TouchableOpacity onPress={() => confirmDelete(item.id)} hitSlop={12}>
            <Text style={styles.delete}>✕</Text>
          </TouchableOpacity>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: spacing.md },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  cardContent: { flex: 1 },
  title: { fontSize: fontSizes.md, fontWeight: '600', color: colors.text },
  coords: { fontSize: fontSizes.sm, color: colors.textSecondary, marginTop: 2 },
  date: { fontSize: fontSizes.sm, color: colors.textSecondary, marginTop: 2 },
  delete: { fontSize: 18, color: colors.accent, paddingLeft: spacing.md },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { fontSize: fontSizes.lg, fontWeight: '600', color: colors.text },
  emptyHint: { fontSize: fontSizes.md, color: colors.textSecondary, marginTop: spacing.xs },
});
