import { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  StyleSheet, Alert, ActivityIndicator,
  KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { saveProfile } from '../../src/services/profile';
import { colors, spacing, fontSizes } from '../../src/constants/theme';

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

async function searchPlaces(query) {
  const url =
    `https://nominatim.openstreetmap.org/search` +
    `?q=${encodeURIComponent(query)}&format=json&limit=6&addressdetails=1`;
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

export default function ProfileSetupScreen() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [month, setMonth] = useState('');
  const [day, setDay] = useState('');
  const [year, setYear] = useState('');

  const [placeQuery, setPlaceQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);

  const [saving, setSaving] = useState(false);
  const searchTimer = useRef(null);

  function handlePlaceSearch(text) {
    setPlaceQuery(text);
    setSelectedPlace(null);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    if (text.length < 2) { setSuggestions([]); return; }
    searchTimer.current = setTimeout(async () => {
      setSearchLoading(true);
      try {
        setSuggestions(await searchPlaces(text));
      } catch {
        setSuggestions([]);
      } finally {
        setSearchLoading(false);
      }
    }, 350);
  }

  function selectPlace(place) {
    setSelectedPlace(place);
    setPlaceQuery(place.label);
    setSuggestions([]);
  }

  function buildBirthday() {
    const monthIndex = Platform.OS === 'web'
      ? MONTHS.indexOf(month) + 1
      : parseInt(month);
    const m = String(monthIndex).padStart(2, '0');
    const d = String(parseInt(day)).padStart(2, '0');
    return `${year}-${m}-${d}`;
  }

  function validate() {
    if (!name.trim()) { Alert.alert('Missing info', 'Please enter your name.'); return false; }
    const monthIndex = Platform.OS === 'web'
      ? MONTHS.indexOf(month) + 1
      : parseInt(month);
    const d = parseInt(day);
    const y = parseInt(year);
    if (!month || monthIndex < 1 || monthIndex > 12) {
      Alert.alert('Missing info', 'Please select a valid birth month.'); return false;
    }
    if (isNaN(d) || d < 1 || d > 31) {
      Alert.alert('Missing info', 'Please enter a valid birth day (1–31).'); return false;
    }
    if (isNaN(y) || y < 1900 || y > new Date().getFullYear()) {
      Alert.alert('Missing info', 'Please enter a valid birth year.'); return false;
    }
    if (!selectedPlace) {
      Alert.alert('Missing info', 'Please search for and select your birthplace.'); return false;
    }
    return true;
  }

  async function handleSave() {
    if (!validate()) return;
    setSaving(true);
    try {
      await saveProfile({
        name: name.trim(),
        birthday: buildBirthday(),
        birth_place_name: selectedPlace.label,
        birth_lat: selectedPlace.lat,
        birth_lng: selectedPlace.lng,
      });
      router.replace('/(tabs)');
    } catch (e) {
      Alert.alert('Error', e.message);
      setSaving(false);
    }
  }

  const webSelectStyle = {
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingLeft: spacing.md,
    paddingRight: spacing.md,
    paddingTop: 14,
    paddingBottom: 14,
    fontSize: fontSizes.md,
    color: month ? colors.text : colors.textSecondary,
    border: 'none',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
    appearance: 'none',
    WebkitAppearance: 'none',
    fontFamily: 'inherit',
    cursor: 'pointer',
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>trax</Text>
          <Text style={styles.title}>Welcome! Tell us{'\n'}about yourself.</Text>
        </View>

        <View style={styles.form}>

          {/* Name */}
          <Text style={styles.label}>Your Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Full name"
            placeholderTextColor={colors.textSecondary}
            autoCapitalize="words"
            returnKeyType="next"
            value={name}
            onChangeText={setName}
          />

          {/* Birthday */}
          <Text style={styles.label}>Date of Birth</Text>
          <View style={styles.birthdayRow}>

            <View style={styles.monthWrap}>
              {Platform.OS === 'web' ? (
                <select
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  style={webSelectStyle}
                >
                  <option value="" disabled>Month</option>
                  {MONTHS.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              ) : (
                <TextInput
                  style={styles.input}
                  placeholder="MM"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="number-pad"
                  maxLength={2}
                  value={month}
                  onChangeText={setMonth}
                />
              )}
            </View>

            <View style={styles.dayWrap}>
              <TextInput
                style={styles.input}
                placeholder="DD"
                placeholderTextColor={colors.textSecondary}
                keyboardType="number-pad"
                maxLength={2}
                value={day}
                onChangeText={setDay}
              />
            </View>

            <View style={styles.yearWrap}>
              <TextInput
                style={styles.input}
                placeholder="YYYY"
                placeholderTextColor={colors.textSecondary}
                keyboardType="number-pad"
                maxLength={4}
                value={year}
                onChangeText={setYear}
              />
            </View>
          </View>

          {/* Birthplace */}
          <Text style={styles.label}>Where Were You Born?</Text>
          <View style={styles.placeSearchWrap}>
            <TextInput
              style={[styles.input, selectedPlace && styles.inputSelected]}
              placeholder="Search for a city or town…"
              placeholderTextColor={colors.textSecondary}
              value={placeQuery}
              onChangeText={handlePlaceSearch}
              autoCorrect={false}
            />
            {searchLoading && (
              <ActivityIndicator
                style={styles.searchSpinner}
                size="small"
                color={colors.primary}
              />
            )}
          </View>

          {suggestions.length > 0 && (
            <View style={styles.suggestionList}>
              {suggestions.map((item, index) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.suggestionItem,
                    index < suggestions.length - 1 && styles.suggestionBorder,
                  ]}
                  onPress={() => selectPlace(item)}
                >
                  <Text style={styles.suggestionText} numberOfLines={2}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {selectedPlace && (
            <Text style={styles.selectedHint}>
              ✓ {selectedPlace.label}
            </Text>
          )}

        </View>

        {/* Submit */}
        <TouchableOpacity
          style={[styles.button, saving && styles.buttonDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.buttonText}>Let's Go</Text>
          }
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  header: { marginBottom: spacing.xl },
  logo: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: -1,
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: fontSizes.xl,
    fontWeight: '700',
    color: colors.text,
    lineHeight: 34,
  },
  form: { marginBottom: spacing.xl },
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
  inputSelected: {
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  birthdayRow: { flexDirection: 'row', gap: spacing.sm },
  monthWrap: { flex: 2 },
  dayWrap: { flex: 1 },
  yearWrap: { flex: 1.2 },
  placeSearchWrap: { position: 'relative' },
  searchSpinner: {
    position: 'absolute',
    right: 14,
    top: 14,
  },
  suggestionList: {
    backgroundColor: colors.background,
    borderRadius: 12,
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    overflow: 'hidden',
  },
  suggestionItem: {
    paddingHorizontal: spacing.md,
    paddingVertical: 13,
  },
  suggestionBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  suggestionText: {
    fontSize: fontSizes.sm,
    color: colors.text,
    lineHeight: 18,
  },
  selectedHint: {
    marginTop: spacing.xs,
    fontSize: fontSizes.sm,
    color: colors.primary,
    fontWeight: '500',
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontSize: fontSizes.md, fontWeight: '700' },
});
