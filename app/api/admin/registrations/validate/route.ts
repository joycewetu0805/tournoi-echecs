import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { createSupabaseServiceClient } from '@/lib/supabase/server';
import { logAdminAction } from '@/lib/audit';
import { enforceRateLimit } from '@/lib/rateLimit';
import { buildNotificationTemplate, sendEmail } from '@/lib/notifications';

export async function POST(request: Request) {
  try {
    await enforceRateLimit('admin-validate');
    const { user } = await requireAdmin();
    const body = await request.json();
    const registrationId = body.registration_id as string;

    const supabase = createSupabaseServiceClient();
    const { data: registration } = await supabase.from('registrations').select('*').eq('id', registrationId).single();
    if (!registration) {
      return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });
    }

    const { data: profile } = await supabase.from('users').select('*').eq('id', registration.user_id).single();
    const expectedAmount = profile && profile.consecutive_participations >= 4 && profile.podium_count === 0 ? 5 : 10;

    const { data: payment } = await supabase
      .from('payments')
      .select('*')
      .eq('user_id', registration.user_id)
      .eq('tournament_id', registration.tournament_id)
      .order('timestamp', { ascending: false })
      .limit(1)
      .single();

    if (!payment || Number(payment.amount) !== expectedAmount) {
      return NextResponse.json({ error: 'INVALID_AMOUNT' }, { status: 400 });
    }

    await supabase.from('payments').update({ status: 'validated', validated_by: user.id }).eq('id', payment.id);
    await supabase.from('registrations').update({ payment_status: 'validated', validated_at: new Date().toISOString() }).eq('id', registrationId);

    const template = buildNotificationTemplate('payment_validated', {});
    if (profile?.email) {
      await sendEmail({ to: profile.email, subject: template.subject, html: template.html });
    }

    await logAdminAction(user.id, 'validate_payment', registrationId, { payment_id: payment.id });

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
