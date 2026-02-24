import { NextResponse } from 'next/server';
import { createSupabaseServiceClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = createSupabaseServiceClient();
  const { data: players } = await supabase
    .from('users')
    .select('id, email, elo, matches_played')
    .order('elo', { ascending: false })
    .limit(50);

  return NextResponse.json({ players: players ?? [] });
}
