import { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, Alert, ActivityIndicator, Platform, KeyboardAvoidingView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { addEvent } from '../src/services/events';
import { colors, spacing, fontSizes } from '../src/constants/theme';

async function searchPlaces(query) {
  const url =
    `https://nominatim.openstreetmap.org/search` +
    `?q=${encodeURIComponent(query)}&format=json&limit=6`;
  const res = await fetch(url, {
    headers: { 'Accept-Language': 'en', 'User-Agent': 'TraxApp/1.0' },
  });
  const data = await res.json();
  return data.map((item) => ({
    id: String(item.place_id),
    label: item.display_name,
    lat: parseFloat(item.lat),
    lng: parseFloat(item.lon),
  }));
}

export default function AddEventScreen() {
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  // Date fields
  const [dateValue, setDateValue] = useState('');   // web: 'YYYY-MM-DD'
  const [month, setMonth] = useState('');
  const [day, setDay] = useState('');
  const [year, setYear] = useState('');

  // Location search
  const [placeQuery, setPlaceQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchTimer = useRef(null);

  function handlePlaceSearch(text) {
    setPlaceQuery(text);
    setSelectedPlace(null);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    if (text.length < 2) { setSuggestions([]); return; }
    searchTimer.current = setTimeout(async () => {
      setSearchLoading(true);
      try { setSuggestions(await searchPlaces(text)); }
      catch { setSuggestions([]); }
      finally { setSearchLoading(false); }
    }, 350);
  }

  function selectPlace(place) {
    setSelectedPlace(place);
    setPlaceQuery(place.label);
    setSuggestions([]);
  }

  function buildDate() {
    if (Platform.OS === 'web') return dateValue || null;
    const m = parseInt(month);
    const d = parseInt(day);
    const y = parseInt(year);
    if (!m || !d || !y) return null;
    return `${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
  }

  function validate() {
    if (!title.trim()) { Alert.alert('Missing info', 'Please enter a title.'); return false; }
    if (!buildDate()) { Alert.alert('Missing info', 'Please enter the event date.'); return false; }
    if (!selectedPlace) { Alert.alert('Missing info', 'Please search for and select a location.'); return false; }
    return true;
  }

  async function handleSave() {
    if (!validate()) return;
    setSaving(true);
    try {
      await addEvent({
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

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
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
            style={{
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
            }}
          />
        ) : (
          <View style={styles.dateRow}>
            <View style={styles.monthWrap}>
              <TextInput style={styles.input} placeholder="MM" placeholderTextColor={colors.textSecondary}
                keyboardType="number-pad" maxLength={2} value={month} onChangeText={setMonth} />
            </View>
            <View style={styles.dayWrap}>
              <TextInput style={styles.input} placeholder="DD" placeholderTextColor={colors.textSecondary}
                keyboardType="number-pad" maxLength={2} value={day} onChangeText={setDay} />
            </View>
            <View style={styles.yearWrap}>
              <TextInput style={styles.input} placeholder="YYYY" placeholderTextColor={colors.textSecondary}
                keyboardType="number-pad" maxLength={4} value={year} onChangeText={setYear} />
            </View>
          </View>
        )}

        <Text style={styles.label}>Location</Text>
        <View>
          <TextInput
            style={[styles.input, selectedPlace && styles.inputSelected]}
            placeholder="Search for a city or place…"
            placeholderTextColor={colors.textSecondary}
            value={placeQuery}
            onChangeText={handlePlaceSearch}
            autoCorrect={false}
          />
          {searchLoading && <ActivityIndicator style={styles.spinner} size="small" color={colors.primary} />}
        </View>

        {suggestions.length > 0 && (
          <View style={styles.suggestionList}>
            {suggestions.map((item, i) => (
              <TouchableOpacity
                key={item.id}
                style={[styles.suggestionItem, i < suggestions.length - 1 && styles.suggestionBorder]}
                onPress={() => selectPlace(item)}
              >
                <Text style={styles.suggestionText} numberOfLines={2}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {selectedPlace && (
          <Text style={styles.selectedHint}>✓ {selectedPlace.label}</Text>
        )}

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
          {saving
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.buttonText}>Save Event</Text>
          }
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  container: { padding: spacing.lg, paddingBottom: 60 },
  label: {
    fontSize: fontSizes.sm,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    fontSize: fontSizes.md,
    color: colors.text,
  },
  inputSelected: { borderWidth: 1.5, borderColor: colors.primary },
  dateRow: { flexDirection: 'row', gap: spacing.sm },
  monthWrap: { flex: 1 },
  dayWrap: { flex: 1 },
  yearWrap: { flex: 1.5 },
  spinner: { position: 'absolute', right: 14, top: 14 },
  suggestionList: {
    backgroundColor: colors.background,
    borderRadius: 12,
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    overflow: 'hidden',
  },
  suggestionItem: { paddingHorizontal: spacing.md, paddingVertical: 13 },
  suggestionBorder: { borderBottomWidth: 1, borderBottomColor: '#E5E5EA' },
  suggestionText: { fontSize: fontSizes.sm, color: colors.text, lineHeight: 18 },
  selectedHint: { marginTop: spacing.xs, fontSize: fontSizes.sm, color: colors.primary, fontWeight: '500' },
  notesInput: { height: 100, textAlignVertical: 'top' },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontSize: fontSizes.md, fontWeight: '700' },
});
