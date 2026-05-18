import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator,
  KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { saveProfile } from '../../src/services/profile';
import { colors, spacing, fontSizes } from '../../src/constants/theme';

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

export default function ProfileSetupScreen() {
  const [name, setName] = useState('');
  const [month, setMonth] = useState('');
  const [day, setDay] = useState('');
  const [year, setYear] = useState('');
  const [loading, setLoading] = useState(false);

  function buildBirthday() {
    if (!month || !day || !year) return null;
    const m = String(MONTHS.indexOf(month) + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    return `${year}-${m}-${d}`;
  }

  function validate() {
    if (!name.trim()) { Alert.alert('Please enter your name'); return false; }
    if (!month || !day || !year) { Alert.alert('Please enter your birthday'); return false; }
    const y = parseInt(year);
    const d = parseInt(day);
    if (isNaN(y) || y < 1900 || y > new Date().getFullYear()) {
      Alert.alert('Please enter a valid year'); return false;
    }
    if (isNaN(d) || d < 1 || d > 31) {
      Alert.alert('Please enter a valid day'); return false;
    }
    return true;
  }

  async function handleSave() {
    if (!validate()) return;
    setLoading(true);
    try {
      await saveProfile({ name: name.trim(), birthday: buildBirthday() });
    } catch (e) {
      Alert.alert('Error saving profile', e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
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
              <TextInput
                style={styles.input}
                placeholder="Month"
                placeholderTextColor={colors.textSecondary}
                value={month}
                onChangeText={(text) => {
                  // auto-match month name as user types
                  const match = MONTHS.find((m) =>
                    m.toLowerCase().startsWith(text.toLowerCase())
                  );
                  setMonth(text.length > 0 && match ? match : text);
                }}
                onBlur={() => {
                  const match = MONTHS.find((m) =>
                    m.toLowerCase() === month.toLowerCase()
                  );
                  if (match) setMonth(match);
                }}
                autoCapitalize="words"
                returnKeyType="next"
              />
            </View>
            <View style={styles.dayWrap}>
              <TextInput
                style={styles.input}
                placeholder="Day"
                placeholderTextColor={colors.textSecondary}
                keyboardType="number-pad"
                maxLength={2}
                returnKeyType="next"
                value={day}
                onChangeText={setDay}
              />
            </View>
            <View style={styles.yearWrap}>
              <TextInput
                style={styles.input}
                placeholder="Year"
                placeholderTextColor={colors.textSecondary}
                keyboardType="number-pad"
                maxLength={4}
                returnKeyType="done"
                onSubmitEditing={handleSave}
                value={year}
                onChangeText={setYear}
              />
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading
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
  logo: { fontSize: 32, fontWeight: '800', color: colors.primary, letterSpacing: -1, marginBottom: spacing.sm },
  title: { fontSize: fontSizes.xl, fontWeight: '700', color: colors.text, lineHeight: 34 },
  form: { marginBottom: spacing.xl },
  label: { fontSize: fontSizes.sm, fontWeight: '600', color: colors.textSecondary, marginTop: spacing.md, marginBottom: spacing.xs, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    fontSize: fontSizes.md,
    color: colors.text,
  },
  birthdayRow: { flexDirection: 'row', gap: spacing.sm },
  monthWrap: { flex: 2 },
  dayWrap: { flex: 1 },
  yearWrap: { flex: 1.2 },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontSize: fontSizes.md, fontWeight: '700' },
});
