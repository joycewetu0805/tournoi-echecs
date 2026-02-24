import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { createSupabaseServiceClient } from '@/lib/supabase/server';
import { logAdminAction } from '@/lib/audit';
import { enforceRateLimit } from '@/lib/rateLimit';

export async function POST(request: Request) {
  try {
    await enforceRateLimit('admin-ban');
    const { user } = await requireAdmin();
    const body = await request.json();
    const { user_id, reason, until } = body as { user_id: string; reason: string; until: string };

    const supabase = createSupabaseServiceClient();
    await supabase.from('users').update({ banned_until: until, ban_reason: reason }).eq('id', user_id);

    await logAdminAction(user.id, 'ban_user', user_id, { reason, until });

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
