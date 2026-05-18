import { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { supabase } from '../src/lib/supabase';
import { getProfile } from '../src/services/profile';

export default function RootLayout() {
  const [session, setSession] = useState(undefined);       // undefined = loading
  const [profileComplete, setProfileComplete] = useState(undefined); // undefined = not yet checked
  const router = useRouter();
  const segments = useSegments();

  // Track auth state
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setProfileComplete(undefined); // re-check profile on auth change
    });
    return () => subscription.unsubscribe();
  }, []);

  // Check profile whenever session (user) changes
  useEffect(() => {
    if (!session) {
      setProfileComplete(undefined);
      return;
    }
    getProfile(session.user.id)
      .then((profile) => setProfileComplete(!!profile?.name))
      .catch(() => setProfileComplete(false));
  }, [session?.user?.id]);

  // Route based on auth + profile state
  useEffect(() => {
    if (session === undefined) return;
    if (session && profileComplete === undefined) return; // still checking profile

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

  // Avoid flash while loading
  if (session === undefined) return null;
  if (session && profileComplete === undefined) return null;

  return <Stack screenOptions={{ headerShown: false }} />;
}
