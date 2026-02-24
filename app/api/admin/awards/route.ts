import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { createSupabaseServiceClient } from '@/lib/supabase/server';
import { logAdminAction } from '@/lib/audit';
import { enforceRateLimit } from '@/lib/rateLimit';

export async function POST(request: Request) {
  try {
    await enforceRateLimit('admin-awards');
    const { user } = await requireAdmin();
    const body = await request.json().catch(() => ({}));
    const month = body.month as number;
    const year = body.year as number;

    const supabase = createSupabaseServiceClient();
    const { data: tournaments } = await supabase
      .from('tournaments')
      .select('id, date')
      .gte('date', `${year}-${String(month).padStart(2, '0')}-01`)
      .lt('date', `${year}-${String(month + 1).padStart(2, '0')}-01`);

    const tournamentIds = tournaments?.map((t) => t.id) ?? [];
    const { data: standings } = await supabase
      .from('standings')
      .select('*')
      .in('tournament_id', tournamentIds)
      .is('group_id', null)
      .order('points', { ascending: false });

    const top3 = (standings ?? []).slice(0, 3);
    if (top3.length === 0) {
      return NextResponse.json({ error: 'NO_DATA' }, { status: 400 });
    }

    await supabase.from('trophies').insert(
      top3.map((standing, index) => ({
        user_id: standing.user_id,
        month,
        year,
        type: `top_${index + 1}`,
        details_json: { points: standing.points }
      }))
    );

    await logAdminAction(user.id, 'generate_monthly_awards', `${year}-${month}`, { count: top3.length });

    return NextResponse.json({ ok: true, top3 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
