import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { createSupabaseServiceClient } from '@/lib/supabase/server';
import { assertBeforeRegistrationClose, isRegistrationOpen } from '@/lib/time';
import { enforceRateLimit } from '@/lib/rateLimit';
import { isCashbackEligible } from '@/lib/finance';
import { buildNotificationTemplate, sendEmail } from '@/lib/notifications';

export async function POST() {
  try {
    await enforceRateLimit('registration');
    const { user, profile } = await requireUser();
    assertBeforeRegistrationClose();
    if (!isRegistrationOpen()) {
      return NextResponse.json({ error: 'REGISTRATION_CLOSED' }, { status: 400 });
    }

    const supabase = createSupabaseServiceClient();

    const division = (profile?.elo ?? 1200) > 1300 ? 'A' : 'B';
    const discount = profile ? isCashbackEligible(profile.consecutive_participations ?? 0, profile.podium_count ?? 0) : false;
    const amount = discount ? 5 : 10;

    const { data: tournament } = await supabase
      .from('tournaments')
      .select('*')
      .eq('status', 'registration')
      .order('date', { ascending: false })
      .limit(1)
      .single();

    if (!tournament) {
      return NextResponse.json({ error: 'NO_ACTIVE_TOURNAMENT' }, { status: 400 });
    }

    const { error } = await supabase.from('registrations').insert({
      tournament_id: tournament.id,
      user_id: user.id,
      payment_status: 'pending',
      division
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    await supabase.from('payments').insert({
      user_id: user.id,
      tournament_id: tournament.id,
      amount,
      method: 'mpesa',
      status: 'pending'
    });

    const template = buildNotificationTemplate('registration_confirmed', {});
    if (profile?.email) {
      await sendEmail({ to: profile.email, subject: template.subject, html: template.html });
    }

    return NextResponse.json({ ok: true, tournament_id: tournament.id, amount });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
