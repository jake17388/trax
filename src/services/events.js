import { supabase } from '../lib/supabase';

export async function getMyEvents() {
  const { data, error } = await supabase
    .from('life_events')
    .select('*')
    .order('event_date', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function addEvent({ title, event_date, place_name, lat, lng, notes }) {
  const { data: { user } } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from('life_events')
    .insert({
      user_id: user.id,
      title,
      event_date,
      place_name,
      lat,
      lng,
      notes: notes ?? null,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateEvent(id, fields) {
  const { error } = await supabase
    .from('life_events')
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
}

export async function deleteEvent(id) {
  const { error } = await supabase
    .from('life_events')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

export async function getFriendEvents(friendId) {
  const { data, error } = await supabase.rpc('get_friend_events', { friend_id: friendId });
  if (error) throw error;
  return data ?? [];
}
