import { NextResponse } from 'next/server';
import { createSupabaseServiceClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tournamentId = searchParams.get('tournament_id');
  const supabase = createSupabaseServiceClient();

  const { data: matches } = await supabase
    .from('matches')
    .select('*')
    .eq('tournament_id', tournamentId)
    .in('round_type', ['quarter', 'semi', 'final']);

  const byRound = (matches ?? []).reduce<Record<string, any[]>>((acc, match) => {
    acc[match.round_type] = acc[match.round_type] ?? [];
    acc[match.round_type].push(match);
    return acc;
  }, {});

  const final = byRound.final?.[0];

  const node = {
    id: final?.id ?? 'final',
    label: 'Finale',
    score: final ? `${final.score1 ?? 0}-${final.score2 ?? 0}` : undefined,
    children: [
      {
        id: byRound.semi?.[0]?.id ?? 'semi-1',
        label: 'Demi 1',
        score: byRound.semi?.[0] ? `${byRound.semi[0].score1 ?? 0}-${byRound.semi[0].score2 ?? 0}` : undefined,
        children: (byRound.quarter ?? []).slice(0, 2).map((match) => ({
          id: match.id,
          label: 'Quart',
          score: `${match.score1 ?? 0}-${match.score2 ?? 0}`
        }))
      },
      {
        id: byRound.semi?.[1]?.id ?? 'semi-2',
        label: 'Demi 2',
        score: byRound.semi?.[1] ? `${byRound.semi[1].score1 ?? 0}-${byRound.semi[1].score2 ?? 0}` : undefined,
        children: (byRound.quarter ?? []).slice(2, 4).map((match) => ({
          id: match.id,
          label: 'Quart',
          score: `${match.score1 ?? 0}-${match.score2 ?? 0}`
        }))
      }
    ]
  };

  return NextResponse.json({ bracket: node });
}
