import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { createSupabaseServiceClient } from '@/lib/supabase/server';
import { getWeeklySchedule } from '@/lib/time';
import { enforceRateLimit } from '@/lib/rateLimit';
import { nextSaturday, parseISO, isValid } from 'date-fns';

function isCronRequest(request: Request) {
  const url = new URL(request.url);
  const secret = url.searchParams.get('secret');
  const header = request.headers.get('x-cron-secret');
  const expected = process.env.CRON_SECRET;
  return expected && (secret === expected || header === expected);
}

export async function POST(request: Request) {
  try {
    await enforceRateLimit('admin-create-tournament');

    const cron = isCronRequest(request);
    if (!cron) {
      await requireAdmin();
    }

    const body = await request.json().catch(() => ({}));
    const format = (body.format as 'pools' | 'round_robin' | 'swiss' | undefined) ?? 'pools';
    const divisionsEnabled = body.divisions_enabled ?? true;

    const targetDate = body.date ? parseISO(body.date) : nextSaturday(new Date());
    if (!isValid(targetDate)) {
      return NextResponse.json({ error: 'INVALID_DATE' }, { status: 400 });
    }

    const dateString = targetDate.toISOString().slice(0, 10);

    const supabase = createSupabaseServiceClient();
    const { data: existing } = await supabase
      .from('tournaments')
      .select('id')
      .eq('date', dateString)
      .single();

    if (existing) {
      return NextResponse.json({ error: 'TOURNAMENT_EXISTS' }, { status: 400 });
    }

    const schedule = getWeeklySchedule(targetDate);

    const { data: created, error } = await supabase
      .from('tournaments')
      .insert({
        date: dateString,
        status: 'registration',
        format,
        swiss_rounds: format === 'swiss' ? 3 : 0,
        divisions_enabled: divisionsEnabled,
        registration_open_at: schedule.registrationOpen.toISOString(),
        registration_close_at: schedule.registrationClose.toISOString(),
        publish_at: schedule.publishAt.toISOString(),
        start_at: schedule.tournamentStart.toISOString(),
        pause_start_at: schedule.pauseStart.toISOString(),
        pause_end_at: schedule.pauseEnd.toISOString(),
        end_at: schedule.tournamentEnd.toISOString()
      })
      .select('*')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true, tournament: created });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  if (!isCronRequest(request)) {
    return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
  }

  return POST(request);
}
