import { supabase } from '../lib/supabase';

export async function getTracks() {
  const { data, error } = await supabase
    .from('tracks')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: row.id,
    title: row.title,
    coordinate: { latitude: row.latitude, longitude: row.longitude },
    createdAt: row.created_at,
  }));
}

export async function saveTrack(track) {
  const { data: { user } } = await supabase.auth.getUser();
  const { error } = await supabase.from('tracks').insert({
    user_id: user.id,
    title: track.title,
    latitude: track.coordinate.latitude,
    longitude: track.coordinate.longitude,
  });
  if (error) throw error;
}

export async function deleteTrack(id) {
  const { error } = await supabase.from('tracks').delete().eq('id', id);
  if (error) throw error;
}
