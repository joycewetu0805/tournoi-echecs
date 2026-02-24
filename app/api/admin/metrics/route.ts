import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { createSupabaseServiceClient } from '@/lib/supabase/server';
import { calculateReturnRate, detectDominance } from '@/lib/metrics';
import { enforceRateLimit } from '@/lib/rateLimit';

export async function GET() {
  try {
    await enforceRateLimit('admin-metrics');
    await requireAdmin();
    const supabase = createSupabaseServiceClient();

    const { data: registrations } = await supabase.from('registrations').select('user_id');
    const uniqueUsers = new Set((registrations ?? []).map((r) => r.user_id));

    const { data: users } = await supabase.from('users').select('id, consecutive_participations');
    const returning = (users ?? []).filter((u) => (u.consecutive_participations ?? 0) > 1).length;

    const returnRate = calculateReturnRate(uniqueUsers.size, returning);
    const dominance = detectDominance(0.62);

    return NextResponse.json({
      returnRate,
      dominance,
      suggestion: dominance ? 'Activer divisions automatiquement.' : 'Equilibre stable.'
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
