import { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, Alert, ActivityIndicator, Platform, KeyboardAvoidingView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { getEvent, updateEvent } from '../src/services/events';
import PlaceSearch from '../src/components/PlaceSearch';
import { colors, spacing, fontSizes } from '../src/constants/theme';

export default function EditEventScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedPlace, setSelectedPlace] = useState(null);

  // Web: single 'YYYY-MM-DD' string; native: three fields
  const [dateValue, setDateValue] = useState('');
  const [month, setMonth] = useState('');
  const [day, setDay] = useState('');
  const [year, setYear] = useState('');

  useEffect(() => {
    getEvent(id)
      .then((e) => {
        setTitle(e.title);
        setNotes(e.notes ?? '');
        setSelectedPlace({ label: e.place_name, lat: e.lat, lng: e.lng });

        // Parse YYYY-MM-DD for both platforms
        setDateValue(e.event_date);
        const [y, m, d] = e.event_date.split('-');
        setYear(y);
        setMonth(String(parseInt(m)));
        setDay(String(parseInt(d)));
      })
      .catch(() => Alert.alert('Error', 'Could not load event.'))
      .finally(() => setLoading(false));
  }, [id]);

  function buildDate() {
    if (Platform.OS === 'web') return dateValue || null;
    const m = parseInt(month), d = parseInt(day), y = parseInt(year);
    if (!m || !d || !y) return null;
    return `${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
  }

  function validate() {
    if (!title.trim()) { Alert.alert('Missing info', 'Please enter a title.'); return false; }
    if (!buildDate())  { Alert.alert('Missing info', 'Please enter the event date.'); return false; }
    if (!selectedPlace){ Alert.alert('Missing info', 'Please select a location.'); return false; }
    return true;
  }

  async function handleSave() {
    if (!validate()) return;
    setSaving(true);
    try {
      await updateEvent(id, {
        title: title.trim(),
        event_date: buildDate(),
        place_name: selectedPlace.label,
        lat: selectedPlace.lat,
        lng: selectedPlace.lng,
        notes: notes.trim() || null,
      });
      router.back();
    } catch (e) {
      Alert.alert('Error', e.message);
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">

        <Text style={styles.label}>Event Title</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Moved to New York"
          placeholderTextColor={colors.textSecondary}
          autoCapitalize="sentences"
          value={title}
          onChangeText={setTitle}
        />

        <Text style={styles.label}>Date</Text>
        {Platform.OS === 'web' ? (
          <input
            type="date"
            value={dateValue}
            onChange={(e) => setDateValue(e.target.value)}
            max={new Date().toISOString().split('T')[0]}
            style={webDateStyle}
          />
        ) : (
          <View style={styles.dateRow}>
            <View style={{ flex: 1 }}>
              <TextInput style={styles.input} placeholder="MM" placeholderTextColor={colors.textSecondary}
                keyboardType="number-pad" maxLength={2} value={month} onChangeText={setMonth} />
            </View>
            <View style={{ flex: 1 }}>
              <TextInput style={styles.input} placeholder="DD" placeholderTextColor={colors.textSecondary}
                keyboardType="number-pad" maxLength={2} value={day} onChangeText={setDay} />
            </View>
            <View style={{ flex: 1.5 }}>
              <TextInput style={styles.input} placeholder="YYYY" placeholderTextColor={colors.textSecondary}
                keyboardType="number-pad" maxLength={4} value={year} onChangeText={setYear} />
            </View>
          </View>
        )}

        <Text style={styles.label}>Location</Text>
        {/* Key forces PlaceSearch to remount with the pre-loaded selection */}
        <PlaceSearch
          key={selectedPlace?.label}
          selected={selectedPlace}
          onSelect={setSelectedPlace}
          placeholder="Search for a city or place…"
        />

        <Text style={styles.label}>Notes (optional)</Text>
        <TextInput
          style={[styles.input, styles.notesInput]}
          placeholder="Any details about this event…"
          placeholderTextColor={colors.textSecondary}
          multiline
          numberOfLines={4}
          value={notes}
          onChangeText={setNotes}
        />

        <TouchableOpacity
          style={[styles.button, saving && styles.buttonDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Save Changes</Text>}
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const webDateStyle = {
  backgroundColor: colors.surface,
  borderRadius: 12,
  paddingLeft: spacing.md,
  paddingRight: spacing.md,
  paddingTop: 14,
  paddingBottom: 14,
  fontSize: fontSizes.md,
  color: colors.text,
  border: 'none',
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box',
  fontFamily: 'inherit',
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  container: { padding: spacing.lg, paddingBottom: 60 },
  label: {
    fontSize: fontSizes.sm, fontWeight: '600', color: colors.textSecondary,
    marginTop: spacing.md, marginBottom: spacing.xs,
    textTransform: 'uppercase', letterSpacing: 0.5,
  },
  input: {
    backgroundColor: colors.surface, borderRadius: 12,
    paddingHorizontal: spacing.md, paddingVertical: 14,
    fontSize: fontSizes.md, color: colors.text,
  },
  dateRow: { flexDirection: 'row', gap: spacing.sm },
  notesInput: { height: 100, textAlignVertical: 'top' },
  button: {
    backgroundColor: colors.primary, borderRadius: 12,
    paddingVertical: 16, alignItems: 'center', marginTop: spacing.xl,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontSize: fontSizes.md, fontWeight: '700' },
});
