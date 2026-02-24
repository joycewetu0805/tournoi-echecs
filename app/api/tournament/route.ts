import { NextResponse } from 'next/server';
import { createSupabaseServiceClient } from '@/lib/supabase/server';
import { getWeeklySchedule, isPauseTime, isTournamentLive, isPublishTime } from '@/lib/time';

export async function GET() {
  const supabase = createSupabaseServiceClient();
  const { data: tournament } = await supabase
    .from('tournaments')
    .select('*')
    .order('date', { ascending: false })
    .limit(1)
    .single();

  const publish = isPublishTime();
  const { data: participants } = publish
    ? await supabase
        .from('registrations')
        .select('user_id')
        .eq('tournament_id', tournament?.id)
        .eq('payment_status', 'validated')
    : { data: [] };

  return NextResponse.json({
    tournament,
    schedule: getWeeklySchedule(),
    live: isTournamentLive(),
    pause: isPauseTime(),
    participants: participants ?? []
  });
}
