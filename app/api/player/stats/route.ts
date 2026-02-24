import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { createSupabaseServiceClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const { user } = await requireUser();
    const supabase = createSupabaseServiceClient();

    const { data: matches } = await supabase
      .from('matches')
      .select('winner_id,status,player1_id,player2_id')
      .or(`player1_id.eq.${user.id},player2_id.eq.${user.id}`);

    let wins = 0;
    let losses = 0;
    let draws = 0;

    (matches ?? []).forEach((match) => {
      if (match.status === 'draw' || (!match.winner_id && match.status === 'completed')) {
        draws += 1;
        return;
      }
      if (match.winner_id === user.id) {
        wins += 1;
        return;
      }
      if (match.status !== 'scheduled' && match.winner_id) {
        losses += 1;
      }
    });

    const ratio = wins + losses > 0 ? Math.round((wins / (wins + losses)) * 1000) / 10 : 0;

    const { data: history } = await supabase
      .from('elo_history')
      .select('created_at, after_elo')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });

    return NextResponse.json({
      wins,
      losses,
      draws,
      ratio,
      history: history ?? []
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
