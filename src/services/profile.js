import { supabase } from '../lib/supabase';

export async function getProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  // PGRST116 = row not found — not an error, just a new user
  if (error && error.code !== 'PGRST116') throw error;
  return data ?? null;
}

export async function saveProfile({ name, birthday }) {
  const { data: { user } } = await supabase.auth.getUser();
  const { error } = await supabase.from('profiles').upsert({
    id: user.id,
    name,
    birthday,
    updated_at: new Date().toISOString(),
  });
  if (error) throw error;
}
