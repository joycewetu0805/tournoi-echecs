import { createSupabaseServiceClient } from './supabase/server';

const WINDOW_SECONDS = 60;
const MAX_REQUESTS = 30;

export async function enforceRateLimit(key: string) {
  const supabase = createSupabaseServiceClient();
  const now = new Date();
  const windowStart = new Date(now.getTime() - WINDOW_SECONDS * 1000);

  const { data: existing } = await supabase
    .from('api_rate_limits')
    .select('*')
    .eq('key', key)
    .single();

  if (!existing) {
    await supabase.from('api_rate_limits').insert({ key, window_start: now.toISOString(), count: 1 });
    return;
  }

  if (new Date(existing.window_start) < windowStart) {
    await supabase.from('api_rate_limits').update({ window_start: now.toISOString(), count: 1 }).eq('key', key);
    return;
  }

  if (existing.count >= MAX_REQUESTS) {
    throw new Error('RATE_LIMITED');
  }

  await supabase.from('api_rate_limits').update({ count: existing.count + 1 }).eq('key', key);
}
