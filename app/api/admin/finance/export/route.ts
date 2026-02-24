import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { createSupabaseServiceClient } from '@/lib/supabase/server';
import { calculatePrizePool, calculateMonthlyPool } from '@/lib/finance';
import { logAdminAction } from '@/lib/audit';
import { enforceRateLimit } from '@/lib/rateLimit';

export async function GET(request: Request) {
  try {
    await enforceRateLimit('admin-export');
    const { user } = await requireAdmin();
    const { searchParams } = new URL(request.url);
    const month = Number(searchParams.get('month')) || new Date().getMonth() + 1;
    const year = Number(searchParams.get('year')) || new Date().getFullYear();

    const supabase = createSupabaseServiceClient();
    const { data: payments } = await supabase
      .from('payments')
      .select('*')
      .eq('status', 'validated')
      .gte('timestamp', `${year}-${String(month).padStart(2, '0')}-01`)
      .lt('timestamp', `${year}-${String(month + 1).padStart(2, '0')}-01`);

    const total = (payments ?? []).reduce((sum, payment) => sum + (payment.amount ?? 0), 0);
    const { prizePool, organization } = calculatePrizePool(total);
    const monthlyPool = calculateMonthlyPool(total);

    const header = 'payment_id,user_id,tournament_id,amount,method,status,timestamp';
    const rows = (payments ?? []).map((payment) => [
      payment.id,
      payment.user_id,
      payment.tournament_id,
      payment.amount,
      payment.method,
      payment.status,
      payment.timestamp
    ].join(','));

    const csv = [
      header,
      ...rows,
      `TOTAL,,,${total},,,`,
      `PRIZE_POOL,,,${prizePool},,,`,
      `ORGANISATION,,,${organization},,,`,
      `MONTHLY_POOL,,,${monthlyPool},,,`
    ].join('\n');

    await logAdminAction(user.id, 'export_finance', `${year}-${month}`, { total, prizePool, monthlyPool });

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="payments-${year}-${month}.csv"`
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
