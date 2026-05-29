export const unstable_settings = { ssr: false };

import { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import TraxMap from '../../src/components/TraxMap';
import TimelineSlider from '../../src/components/TimelineSlider';
import { supabase } from '../../src/lib/supabase';
import { getProfile } from '../../src/services/profile';
import { getMyEvents } from '../../src/services/events';
import { colors, spacing, fontSizes } from '../../src/constants/theme';

function interpolateLocation(points, fraction) {
  if (!points || points.length === 0) return null;
  const birthTime = new Date(points[0].event_date).getTime();
  const nowTime = Date.now();
  const target = birthTime + fraction * (nowTime - birthTime);

  if (target <= birthTime) return { lat: points[0].lat, lng: points[0].lng };

  for (let i = 0; i < points.length - 1; i++) {
    const t1 = new Date(points[i].event_date).getTime();
    const t2 = new Date(points[i + 1].event_date).getTime();
    if (target >= t1 && target <= t2) {
      const t = t2 === t1 ? 0 : (target - t1) / (t2 - t1);
      return {
        lat: points[i].lat + t * (points[i + 1].lat - points[i].lat),
        lng: points[i].lng + t * (points[i + 1].lng - points[i].lng),
      };
    }
  }
  const last = points[points.length - 1];
  return { lat: last.lat, lng: last.lng };
}

function labelFromFraction(birthday, fraction) {
  const birthTime = new Date(birthday).getTime();
  const target = new Date(birthTime + fraction * (Date.now() - birthTime));
  return target.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

function birthdayLabel(birthday) {
  return new Date(birthday).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

export default function HomeScreen() {
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [events, setEvents] = useState([]);
  const [sliderValue, setSliderValue] = useState(1);
  const [isScrubbing, setIsScrubbing] = useState(false);

  async function load() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const [p, e] = await Promise.all([getProfile(user.id), getMyEvents()]);
    setProfile(p);
    setEvents(e);
  }

  useEffect(() => { load(); }, []);
  useFocusEffect(useCallback(() => { load(); }, []));

  const allPoints = profile ? [
    {
      id: 'birth',
      event_date: profile.birthday,
      lat: profile.birth_lat,
      lng: profile.birth_lng,
      title: 'Born here',
      place_name: profile.birth_place_name,
    },
    ...events,
  ] : [];

  const flyTo = allPoints.length > 0
    ? interpolateLocation(allPoints, sliderValue)
    : null;

  const currentLabel = profile
    ? labelFromFraction(profile.birthday, sliderValue)
    : '';

  return (
    // position: 'relative' is required on web so that absoluteFill children
    // (the map) are positioned relative to this container, not the page root.
    <View style={styles.container}>

      <TraxMap
        polylinePoints={allPoints}
        eventMarkers={allPoints}
        flyTo={flyTo}
        animateFly={!isScrubbing}
      />

      {/* All overlays need zIndex > Leaflet's internal layers (~600) */}
      {profile && (
        <View style={styles.greeting}>
          <Text style={styles.greetingText}>Hello, {profile.name}</Text>
        </View>
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/add-event')}
      >
        <Text style={styles.fabText}>+ Add Event</Text>
      </TouchableOpacity>

      {profile && (
        <View style={styles.timeline}>
          <TimelineSlider
            value={sliderValue}
            onChange={setSliderValue}
            onScrubStart={() => setIsScrubbing(true)}
            onScrubEnd={() => setIsScrubbing(false)}
            minLabel={birthdayLabel(profile.birthday)}
            maxLabel="Today"
            currentLabel={currentLabel}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative', // required on web for absoluteFill children
  },
  greeting: {
    position: 'absolute',
    zIndex: 1000,
    top: 56,
    left: spacing.lg,
    right: spacing.lg,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 1000,
  },
  greetingText: {
    fontSize: fontSizes.md,
    fontWeight: '700',
    color: colors.primary,
  },
  fab: {
    position: 'absolute',
    zIndex: 1000,
    bottom: 130,
    alignSelf: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 13,
    borderRadius: 26,
    elevation: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  fabText: { color: '#fff', fontSize: fontSizes.md, fontWeight: '600' },
  timeline: {
    position: 'absolute',
    zIndex: 1000,
    bottom: 0,
    left: 0,
    right: 0,
    elevation: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
});
