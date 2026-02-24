import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { createSupabaseServiceClient } from '@/lib/supabase/server';
import { buildNotificationTemplate, sendEmail } from '@/lib/notifications';
import { logAdminAction } from '@/lib/audit';
import { enforceRateLimit } from '@/lib/rateLimit';

export async function POST(request: Request) {
  try {
    await enforceRateLimit('admin-notify');
    const { user } = await requireAdmin();
    const body = await request.json();
    const { type, user_ids } = body as { type: string; user_ids: string[] };

    const supabase = createSupabaseServiceClient();
    const { data: users } = await supabase.from('users').select('id, email').in('id', user_ids);

    const template = buildNotificationTemplate(type, {});

    await Promise.all(
      (users ?? []).map((recipient) =>
        sendEmail({ to: recipient.email, subject: template.subject, html: template.html })
      )
    );

    await logAdminAction(user.id, 'send_notification', type, { recipients: user_ids.length });

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
