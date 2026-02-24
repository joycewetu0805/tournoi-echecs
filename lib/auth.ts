import { createSupabaseServerClient } from './supabase/server';

export async function getCurrentUser() {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();
  if (error) return null;
  return data.user;
}

export async function getProfile(userId: string) {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase.from('users').select('*').eq('id', userId).single();
  return data;
}

export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user) throw new Error('NOT_AUTHENTICATED');
  const profile = await getProfile(user.id);
  if (!profile || profile.role !== 'admin') throw new Error('FORBIDDEN');
  if (profile.banned_until && new Date(profile.banned_until) > new Date()) throw new Error('BANNED');
  return { user, profile };
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) throw new Error('NOT_AUTHENTICATED');
  const profile = await getProfile(user.id);
  if (profile?.banned_until && new Date(profile.banned_until) > new Date()) throw new Error('BANNED');
  return { user, profile };
}
