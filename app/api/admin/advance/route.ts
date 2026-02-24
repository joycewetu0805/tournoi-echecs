import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { createSupabaseServiceClient } from '@/lib/supabase/server';
import { logAdminAction } from '@/lib/audit';
import { generateKnockoutSeeds, generateSwissRound } from '@/lib/draw';
import { enforceRateLimit } from '@/lib/rateLimit';

export async function POST(request: Request) {
  try {
    await enforceRateLimit('admin-advance');
    const { user } = await requireAdmin();
    const body = await request.json().catch(() => ({}));
    const tournamentId = body.tournament_id as string | undefined;
    const roundType = body.round_type as string | undefined;

    const supabase = createSupabaseServiceClient();
    const { data: tournament } = await supabase
      .from('tournaments')
      .select('*')
      .eq('id', tournamentId)
      .single();

    if (!tournament) {
      return NextResponse.json({ error: 'TOURNAMENT_NOT_FOUND' }, { status: 404 });
    }

    if (roundType && ['quarter', 'semi', 'final'].includes(roundType)) {
      if (roundType === 'final') {
        const { data: finalMatches } = await supabase
          .from('matches')
          .select('*')
          .eq('tournament_id', tournament.id)
          .eq('round_type', 'final');

        const done = (finalMatches ?? []).every((match) => match.status === 'completed' || match.status === 'forfeit');
        if (!done) {
          return NextResponse.json({ error: 'FINAL_NOT_COMPLETE' }, { status: 400 });
        }

        await supabase.from('matches').update({ locked: true }).eq('tournament_id', tournament.id).eq('round_type', 'final');
        await supabase.from('tournaments').update({ status: 'finished' }).eq('id', tournament.id);
        await logAdminAction(user.id, 'finish_tournament', tournament.id, {});
        return NextResponse.json({ ok: true, status: 'finished' });
      }

      const nextRound = roundType === 'quarter' ? 'semi' : 'final';
      const { data: roundMatches } = await supabase
        .from('matches')
        .select('*')
        .eq('tournament_id', tournament.id)
        .eq('round_type', roundType);

      const allCompleted = (roundMatches ?? []).every((match) => match.status === 'completed' || match.status === 'forfeit');
      if (!allCompleted) {
        return NextResponse.json({ error: 'ROUND_NOT_COMPLETE' }, { status: 400 });
      }

      const byDivision = (roundMatches ?? []).reduce<Record<string, typeof roundMatches>>((acc, match) => {
        const division = match.division ?? 'A';
        acc[division] = acc[division] ?? [];
        acc[division].push(match);
        return acc;
      }, {});

      const nextMatches = [];
      for (const [division, matches] of Object.entries(byDivision)) {
        const winners = matches.map((match) => match.winner_id).filter(Boolean) as string[];
        for (let i = 0; i < winners.length; i += 2) {
          nextMatches.push({
            tournament_id: tournament.id,
            round_type: nextRound,
            division,
            player1_id: winners[i],
            player2_id: winners[i + 1],
            status: winners[i + 1] ? 'scheduled' : 'completed',
            winner_id: winners[i + 1] ? null : winners[i]
          });
        }
      }

      await supabase.from('matches').update({ locked: true }).eq('tournament_id', tournament.id).eq('round_type', roundType);
      await supabase.from('matches').insert(nextMatches);

      await logAdminAction(user.id, 'advance_knockout_round', tournament.id, { from: roundType, to: nextRound });
      return NextResponse.json({ ok: true, nextRound });
    }

    if (tournament.format === 'swiss') {
      const { data: swissMatches } = await supabase
        .from('matches')
        .select('*')
        .eq('tournament_id', tournament.id)
        .eq('round_type', 'swiss');

      const currentRound = Math.max(...(swissMatches ?? []).map((m) => m.round_no ?? 1), 1);

      const standings = await supabase
        .from('standings')
        .select('*')
        .eq('tournament_id', tournament.id)
        .is('group_id', null);

      if (currentRound < (tournament.swiss_rounds ?? 3)) {
        const byDivision = (standings.data ?? []).reduce<Record<string, typeof standings.data>>((acc, standing) => {
          const division = standing.division ?? 'A';
          acc[division] = acc[division] ?? [];
          acc[division].push(standing);
          return acc;
        }, {});

        const insertedMatches = [];
        for (const [division, divisionStandings] of Object.entries(byDivision)) {
          const players = await supabase
            .from('users')
            .select('id, elo')
            .in('id', divisionStandings.map((s) => s.user_id));

          const pairings = generateSwissRound(
            (players.data ?? []).map((p) => ({ id: p.id, elo: p.elo ?? 1200, division: division as 'A' | 'B' })),
            divisionStandings.map((s) => ({
              id: s.user_id,
              score: s.points,
              opponents: s.opponents ?? []
            }))
          );

          insertedMatches.push(
            ...pairings.map((pairing) => ({
              tournament_id: tournament.id,
              round_type: 'swiss',
              round_no: currentRound + 1,
              division,
              player1_id: pairing.player1_id,
              player2_id: pairing.player2_id,
              status: pairing.is_bye ? 'completed' : 'scheduled'
            }))
          );
        }

        await supabase
          .from('matches')
          .update({ locked: true })
          .eq('tournament_id', tournament.id)
          .eq('round_type', 'swiss')
          .eq('round_no', currentRound);
        await supabase.from('matches').insert(insertedMatches);

        await logAdminAction(user.id, 'advance_swiss', tournament.id, { round: currentRound + 1 });
        return NextResponse.json({ ok: true, round: currentRound + 1 });
      }

      const { data: swissStandings } = await supabase
        .from('standings')
        .select('*')
        .eq('tournament_id', tournament.id)
        .is('group_id', null)
        .order('points', { ascending: false });

      const byDivision = (swissStandings ?? []).reduce<Record<string, typeof swissStandings>>((acc, standing) => {
        const division = standing.division ?? 'A';
        acc[division] = acc[division] ?? [];
        acc[division].push(standing);
        return acc;
      }, {});

      const createdMatches = [];
      let qualifierCount = 0;

      for (const [division, standingsByDivision] of Object.entries(byDivision)) {
        const divisionQualifierCount = Math.min(8, standingsByDivision.length);
        qualifierCount += divisionQualifierCount;
        const qualifiedIds = standingsByDivision.slice(0, divisionQualifierCount).map((s) => s.user_id);
        const { data: qualifiedPlayers } = await supabase
          .from('users')
          .select('id, elo')
          .in('id', qualifiedIds);

        const seeds = generateKnockoutSeeds(
          (qualifiedPlayers ?? []).map((p) => ({ id: p.id, elo: p.elo ?? 1200, division: division as 'A' | 'B' }))
        );

        createdMatches.push(
          ...seeds.map((seed) => ({
            tournament_id: tournament.id,
            round_type: 'quarter',
            division,
            player1_id: seed.player1_id,
            player2_id: seed.player2_id,
            status: seed.player2_id ? 'scheduled' : 'completed',
            winner_id: seed.player2_id ? null : seed.player1_id
          }))
        );
      }

      await supabase.from('matches').update({ locked: true }).eq('tournament_id', tournament.id).eq('round_type', 'swiss');
      await supabase.from('matches').insert(createdMatches);

      await supabase.from('tournaments').update({ status: 'knockout' }).eq('id', tournament.id);
      await logAdminAction(user.id, 'advance_swiss_to_knockout', tournament.id, { qualifierCount });
      return NextResponse.json({ ok: true, qualifierCount });
    }

    const { data: groupStandings } = await supabase
      .from('standings')
      .select('*')
      .eq('tournament_id', tournament.id)
      .not('group_id', 'is', null);

    const groupedByDivision = (groupStandings ?? []).reduce<Record<string, typeof groupStandings>>((acc, standing) => {
      const division = standing.division ?? 'A';
      acc[division] = acc[division] ?? [];
      acc[division].push(standing);
      return acc;
    }, {});

    const createdMatches = [];

    for (const [division, standingsByDivision] of Object.entries(groupedByDivision)) {
      const qualifiers = standingsByDivision
        .sort((a, b) => b.points - a.points)
        .reduce<Record<string, typeof standingsByDivision>>((acc, standing) => {
          const groupId = standing.group_id as string;
          acc[groupId] = acc[groupId] ?? [];
          acc[groupId].push(standing);
          return acc;
        }, {});

      const qualifiedUserIds = Object.values(qualifiers)
        .flatMap((group) => group.slice(0, 2))
        .map((standing) => standing.user_id);

      const { data: qualifiedPlayers } = await supabase
        .from('users')
        .select('id, elo')
        .in('id', qualifiedUserIds);

      const seeds = generateKnockoutSeeds(
        (qualifiedPlayers ?? []).map((p) => ({ id: p.id, elo: p.elo ?? 1200, division: division as 'A' | 'B' }))
      );

      createdMatches.push(
        ...seeds.map((seed) => ({
          tournament_id: tournament.id,
          round_type: 'quarter',
          division,
          player1_id: seed.player1_id,
          player2_id: seed.player2_id,
          status: seed.player2_id ? 'scheduled' : 'completed',
          winner_id: seed.player2_id ? null : seed.player1_id
        }))
      );
    }

    await supabase.from('matches').update({ locked: true }).eq('tournament_id', tournament.id).eq('round_type', 'pool');
    await supabase.from('matches').insert(createdMatches);

    await supabase.from('tournaments').update({ status: 'knockout' }).eq('id', tournament.id);
    await logAdminAction(user.id, 'advance_knockout', tournament.id, { total_qualifiers: createdMatches.length });

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
