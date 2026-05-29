import { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { supabase } from '../src/lib/supabase';
import { getProfile } from '../src/services/profile';

export default function RootLayout() {
  const [session, setSession] = useState(undefined);
  const [profileComplete, setProfileComplete] = useState(undefined);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setProfileComplete(undefined);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Re-check profile on session change OR whenever the user navigates to a new
  // route group — this is what makes Let's Go work after saving the profile.
  useEffect(() => {
    if (!session) { setProfileComplete(undefined); return; }
    getProfile(session.user.id)
      .then((profile) => setProfileComplete(!!profile?.name))
      .catch(() => setProfileComplete(false));
  }, [session?.user?.id, segments[0]]);

  useEffect(() => {
    if (session === undefined) return;
    if (session && profileComplete === undefined) return;

    const inAuth = segments[0] === '(auth)';
    const inOnboarding = segments[0] === '(onboarding)';

    if (!session) {
      if (!inAuth) router.replace('/(auth)/login');
    } else if (!profileComplete) {
      if (!inOnboarding) router.replace('/(onboarding)');
    } else {
      if (inAuth || inOnboarding) router.replace('/(tabs)');
    }
  }, [session, profileComplete, segments]);

  if (session === undefined) return null;
  if (session && profileComplete === undefined) return null;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(onboarding)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen
        name="add-event"
        options={{ presentation: 'modal', headerShown: true, title: 'Add Life Event', headerBackTitle: 'Back' }}
      />
      <Stack.Screen
        name="edit-event"
        options={{ presentation: 'modal', headerShown: true, title: 'Edit Event', headerBackTitle: 'Back' }}
      />
    </Stack>
  );
}
