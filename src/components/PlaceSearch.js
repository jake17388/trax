import { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { colors, spacing, fontSizes } from '../constants/theme';

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

// selected: { label, lat, lng } | null
// onSelect: called with { label, lat, lng } when user picks a result, or null when they clear
export default function PlaceSearch({ selected, onSelect, placeholder = 'Search for a place…' }) {
  const [query, setQuery] = useState(selected?.label ?? '');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const timer = useRef(null);

  function handleChange(text) {
    setQuery(text);
    onSelect(null);
    if (timer.current) clearTimeout(timer.current);
    if (text.length < 2) { setSuggestions([]); return; }
    timer.current = setTimeout(async () => {
      setLoading(true);
      try { setSuggestions(await searchPlaces(text)); }
      catch { setSuggestions([]); }
      finally { setLoading(false); }
    }, 350);
  }

  function pick(place) {
    setQuery(place.label);
    setSuggestions([]);
    onSelect(place);
  }

  return (
    <View>
      <View>
        <TextInput
          style={[styles.input, selected && styles.inputSelected]}
          placeholder={placeholder}
          placeholderTextColor={colors.textSecondary}
          value={query}
          onChangeText={handleChange}
          autoCorrect={false}
        />
        {loading && (
          <ActivityIndicator style={styles.spinner} size="small" color={colors.primary} />
        )}
      </View>

      {suggestions.length > 0 && (
        <View style={styles.list}>
          {suggestions.map((item, i) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.item, i < suggestions.length - 1 && styles.itemBorder]}
              onPress={() => pick(item)}
            >
              <Text style={styles.itemText} numberOfLines={2}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {selected && (
        <Text style={styles.confirmed}>✓ {selected.label}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
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
  spinner: { position: 'absolute', right: 14, top: 14 },
  list: {
    backgroundColor: colors.background,
    borderRadius: 12,
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    overflow: 'hidden',
  },
  item: { paddingHorizontal: spacing.md, paddingVertical: 13 },
  itemBorder: { borderBottomWidth: 1, borderBottomColor: '#E5E5EA' },
  itemText: { fontSize: fontSizes.sm, color: colors.text, lineHeight: 18 },
  confirmed: {
    marginTop: 6,
    fontSize: fontSizes.sm,
    color: colors.primary,
    fontWeight: '500',
  },
});
