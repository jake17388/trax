import { supabase } from '../lib/supabase';

export async function getProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error && error.code !== 'PGRST116') throw error;
  return data ?? null;
}

export async function saveProfile({ name, birthday, birth_place_name, birth_lat, birth_lng }) {
  const { data: { user } } = await supabase.auth.getUser();
  const { error } = await supabase.from('profiles').upsert({
    id: user.id,
    name,
    birthday,
    birth_place_name,
    birth_lat,
    birth_lng,
    updated_at: new Date().toISOString(),
  });
  if (error) throw error;
}
