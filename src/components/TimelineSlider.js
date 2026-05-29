import { useRef, useCallback } from 'react';
import { View, Text, PanResponder, StyleSheet, Platform } from 'react-native';
import { colors, fontSizes, spacing } from '../constants/theme';

const THUMB_SIZE = 22;

export default function TimelineSlider({ value, onChange, minLabel, maxLabel, currentLabel }) {
  const trackWidth = useRef(0);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        if (trackWidth.current === 0) return;
        const x = evt.nativeEvent.locationX;
        onChange(Math.max(0, Math.min(1, x / trackWidth.current)));
      },
      onPanResponderMove: (evt) => {
        if (trackWidth.current === 0) return;
        const x = evt.nativeEvent.locationX;
        onChange(Math.max(0, Math.min(1, x / trackWidth.current)));
      },
    })
  ).current;

  const onLayout = useCallback((e) => {
    trackWidth.current = e.nativeEvent.layout.width;
  }, []);

  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        <Text style={styles.currentLabel}>{currentLabel}</Text>
        <input
          type="range"
          min={0}
          max={1000}
          value={Math.round(value * 1000)}
          onChange={(e) => onChange(parseInt(e.target.value) / 1000)}
          style={{
            width: '100%',
            accentColor: colors.accent,
            cursor: 'pointer',
            margin: '6px 0',
          }}
        />
        <View style={styles.endLabels}>
          <Text style={styles.endLabel}>{minLabel}</Text>
          <Text style={styles.endLabel}>{maxLabel}</Text>
        </View>
      </View>
    );
  }

  const thumbLeft = `${value * 100}%`;

  return (
    <View style={styles.container}>
      <Text style={styles.currentLabel}>{currentLabel}</Text>
      <View
        style={styles.trackWrap}
        onLayout={onLayout}
        {...panResponder.panHandlers}
      >
        <View style={styles.track} />
        <View style={[styles.fill, { width: `${value * 100}%` }]} />
        <View style={[styles.thumb, { left: `${value * 100}%`, marginLeft: -(THUMB_SIZE / 2) }]} />
      </View>
      <View style={styles.endLabels}>
        <Text style={styles.endLabel}>{minLabel}</Text>
        <Text style={styles.endLabel}>{maxLabel}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    backgroundColor: '#fff',
  },
  currentLabel: {
    fontSize: fontSizes.sm,
    fontWeight: '600',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  trackWrap: {
    height: THUMB_SIZE,
    justifyContent: 'center',
  },
  track: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E5E5EA',
  },
  fill: {
    position: 'absolute',
    left: 0,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.accent,
  },
  thumb: {
    position: 'absolute',
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    backgroundColor: colors.accent,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  endLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  endLabel: {
    fontSize: 11,
    color: colors.textSecondary,
  },
});
