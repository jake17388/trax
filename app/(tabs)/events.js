import { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { getMyEvents, deleteEvent } from '../../src/services/events';
import { colors, spacing, fontSizes } from '../../src/constants/theme';

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

export default function EventsScreen() {
  const router = useRouter();
  const [events, setEvents] = useState([]);

  useFocusEffect(
    useCallback(() => {
      getMyEvents().then(setEvents).catch(() => {});
    }, [])
  );

  function confirmDelete(id, title) {
    Alert.alert('Delete Event', `Remove "${title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteEvent(id);
          setEvents((prev) => prev.filter((e) => e.id !== id));
        },
      },
    ]);
  }

  if (events.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyTitle}>No events yet</Text>
        <Text style={styles.emptyHint}>Tap + Add Event on the map to start your trax.</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => router.push('/add-event')}>
          <Text style={styles.addButtonText}>+ Add Your First Event</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.flex}>
      <FlatList
        data={[...events].reverse()}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push(`/edit-event?id=${item.id}`)}
            activeOpacity={0.7}
          >
            <View style={styles.dot} />
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardDate}>{formatDate(item.event_date)}</Text>
              <Text style={styles.cardPlace} numberOfLines={1}>{item.place_name}</Text>
              {item.notes ? (
                <Text style={styles.cardNotes} numberOfLines={2}>{item.notes}</Text>
              ) : null}
            </View>
            <TouchableOpacity
              onPress={() => confirmDelete(item.id, item.title)}
              hitSlop={12}
              style={styles.deleteBtn}
            >
              <Text style={styles.deleteText}>✕</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        )}
      />
      <TouchableOpacity style={styles.fab} onPress={() => router.push('/add-event')}>
        <Text style={styles.fabText}>+ Add Event</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  list: { padding: spacing.md, paddingBottom: 100 },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: spacing.md,
    marginBottom: spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.accent,
    marginTop: 5,
    marginRight: 12,
    flexShrink: 0,
  },
  cardContent: { flex: 1 },
  cardTitle: { fontSize: fontSizes.md, fontWeight: '600', color: colors.text },
  cardDate: { fontSize: fontSizes.sm, color: colors.primary, marginTop: 2, fontWeight: '500' },
  cardPlace: { fontSize: fontSizes.sm, color: colors.textSecondary, marginTop: 1 },
  cardNotes: { fontSize: fontSizes.sm, color: colors.textSecondary, marginTop: 4, fontStyle: 'italic' },
  deleteBtn: { paddingLeft: spacing.sm },
  deleteText: { fontSize: 16, color: colors.textSecondary },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  emptyTitle: { fontSize: fontSizes.lg, fontWeight: '700', color: colors.text, marginBottom: spacing.xs },
  emptyHint: { fontSize: fontSizes.md, color: colors.textSecondary, textAlign: 'center', marginBottom: spacing.xl },
  addButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 13,
  },
  addButtonText: { color: '#fff', fontSize: fontSizes.md, fontWeight: '600' },
  fab: {
    position: 'absolute',
    bottom: 24,
    alignSelf: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 13,
    borderRadius: 26,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  fabText: { color: '#fff', fontSize: fontSizes.md, fontWeight: '600' },
});
