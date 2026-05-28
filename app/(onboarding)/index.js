import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
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

export default function ProfileSetupScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [month, setMonth] = useState('');   // '1'–'12' on native, month name on web
  const [day, setDay] = useState('');
  const [year, setYear] = useState('');
  const [loading, setLoading] = useState(false);

  function buildBirthday() {
    if (!month || !day || !year) return null;
    const monthIndex = Platform.OS === 'web'
      ? MONTHS.indexOf(month) + 1
      : parseInt(month);
    const m = String(monthIndex).padStart(2, '0');
    const d = String(parseInt(day)).padStart(2, '0');
    return `${year}-${m}-${d}`;
  }

  function validate() {
    if (!name.trim()) { Alert.alert('Please enter your name'); return false; }
    if (!month || !day || !year) { Alert.alert('Please complete your date of birth'); return false; }
    const monthIndex = Platform.OS === 'web'
      ? MONTHS.indexOf(month) + 1
      : parseInt(month);
    const d = parseInt(day);
    const y = parseInt(year);
    if (monthIndex < 1 || monthIndex > 12) { Alert.alert('Please select a valid month'); return false; }
    if (isNaN(d) || d < 1 || d > 31) { Alert.alert('Please enter a valid day (1–31)'); return false; }
    if (isNaN(y) || y < 1900 || y > new Date().getFullYear()) {
      Alert.alert('Please enter a valid year'); return false;
    }
    return true;
  }

  async function handleSave() {
    if (!validate()) return;
    setLoading(true);
    try {
      await saveProfile({ name: name.trim(), birthday: buildBirthday() });
      router.replace('/(tabs)');
    } catch (e) {
      Alert.alert('Error saving profile', e.message);
      setLoading(false);
    }
  }

  const inputStyle = {
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
    appearance: 'none',
    WebkitAppearance: 'none',
    fontFamily: 'inherit',
  };

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

          <Text style={styles.label}>Date of Birth</Text>
          <View style={styles.birthdayRow}>

            {/* Month */}
            <View style={styles.monthWrap}>
              {Platform.OS === 'web' ? (
                <select
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  style={{
                    ...inputStyle,
                    color: month ? colors.text : colors.textSecondary,
                    cursor: 'pointer',
                  }}
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
                  returnKeyType="next"
                  value={month}
                  onChangeText={setMonth}
                />
              )}
            </View>

            {/* Day */}
            <View style={styles.dayWrap}>
              <TextInput
                style={styles.input}
                placeholder="DD"
                placeholderTextColor={colors.textSecondary}
                keyboardType="number-pad"
                maxLength={2}
                returnKeyType="next"
                value={day}
                onChangeText={setDay}
              />
            </View>

            {/* Year */}
            <View style={styles.yearWrap}>
              <TextInput
                style={styles.input}
                placeholder="YYYY"
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
