import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { createSupabaseServiceClient } from '@/lib/supabase/server';
import { logAdminAction } from '@/lib/audit';
import { computeStandings } from '@/lib/standings';
import { enforceRateLimit } from '@/lib/rateLimit';
import { buildNotificationTemplate, sendEmail } from '@/lib/notifications';
import { computeEloDelta } from '@/lib/elo';

export async function POST(request: Request) {
  try {
    await enforceRateLimit('admin-score');
    const { user } = await requireAdmin();
    const body = await request.json();
    const matchId = body.match_id as string;
    const score1 = body.score1 !== undefined ? Number(body.score1) : null;
    const score2 = body.score2 !== undefined ? Number(body.score2) : null;
    const status = (body.status as string | undefined) ?? 'completed';

    const supabase = createSupabaseServiceClient();
    const { data: match } = await supabase.from('matches').select('*').eq('id', matchId).single();

    if (!match) {
      return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });
    }
    if (match.locked) {
      return NextResponse.json({ error: 'MATCH_LOCKED' }, { status: 400 });
    }

    let winnerId = null as string | null;
    if (score1 !== null && score2 !== null) {
      if (score1 > score2) winnerId = match.player1_id;
      if (score2 > score1) winnerId = match.player2_id;
    }
    if (status === 'forfeit' && body.winner_id) {
      winnerId = body.winner_id as string;
    }

    await supabase
      .from('matches')
      .update({ score1, score2, winner_id: winnerId, status })
      .eq('id', matchId);

    const isFinalized = ['completed', 'forfeit', 'draw'].includes(status);
    if (isFinalized && match.player2_id && !match.elo_applied) {
      const { data: players } = await supabase
        .from('users')
        .select('id, elo, matches_played')
        .in('id', [match.player1_id, match.player2_id]);

      const player1 = (players ?? []).find((p) => p.id === match.player1_id);
      const player2 = (players ?? []).find((p) => p.id === match.player2_id);

      if (player1 && player2) {
        const scoreA = status === 'draw' ? 0.5 : winnerId === match.player1_id ? 1 : 0;
        const scoreB = 1 - scoreA;
        const kA = (player1.matches_played ?? 0) < 10 ? 40 : 20;
        const kB = (player2.matches_played ?? 0) < 10 ? 40 : 20;

        const deltaA = computeEloDelta(player1.elo ?? 1200, player2.elo ?? 1200, scoreA, kA);
        const deltaB = computeEloDelta(player2.elo ?? 1200, player1.elo ?? 1200, scoreB, kB);

        const newEloA = (player1.elo ?? 1200) + deltaA;
        const newEloB = (player2.elo ?? 1200) + deltaB;

        await supabase.from('users').update({ elo: newEloA, matches_played: (player1.matches_played ?? 0) + 1 }).eq('id', player1.id);
        await supabase.from('users').update({ elo: newEloB, matches_played: (player2.matches_played ?? 0) + 1 }).eq('id', player2.id);

        await supabase.from('elo_history').insert([
          {
            user_id: player1.id,
            tournament_id: match.tournament_id,
            before_elo: player1.elo ?? 1200,
            after_elo: newEloA,
            delta: deltaA
          },
          {
            user_id: player2.id,
            tournament_id: match.tournament_id,
            before_elo: player2.elo ?? 1200,
            after_elo: newEloB,
            delta: deltaB
          }
        ]);

        await supabase.from('matches').update({ elo_applied: true }).eq('id', matchId);
      }
    }

    if (match.round_type === 'swiss') {
      const { data: swissMatches } = await supabase
        .from('matches')
        .select('*')
        .eq('tournament_id', match.tournament_id)
        .eq('round_type', 'swiss');

      const players = new Set<string>();
      swissMatches?.forEach((m) => {
        players.add(m.player1_id);
        if (m.player2_id) players.add(m.player2_id);
      });

      const standings = computeStandings(Array.from(players), (swissMatches ?? []).map((m) => ({
        player1_id: m.player1_id,
        player2_id: m.player2_id,
        score1: m.score1,
        score2: m.score2,
        winner_id: m.winner_id,
        status: m.status
      })));

      await supabase.from('standings').upsert(
        standings.map((standing) => ({
          tournament_id: match.tournament_id,
          group_id: null,
          user_id: standing.player_id,
          division: match.division ?? null,
          points: standing.points,
          tie_break: standing.tie_break,
          wins: standing.wins,
          losses: standing.losses,
          draws: standing.draws,
          opponents: standing.opponents
        }))
      );
    }

    if (match.group_id) {
      const { data: groupMatches } = await supabase
        .from('matches')
        .select('*')
        .eq('group_id', match.group_id);

      const players = new Set<string>();
      groupMatches?.forEach((m) => {
        players.add(m.player1_id);
        if (m.player2_id) players.add(m.player2_id);
      });

      const standings = computeStandings(Array.from(players), (groupMatches ?? []).map((m) => ({
        player1_id: m.player1_id,
        player2_id: m.player2_id,
        score1: m.score1,
        score2: m.score2,
        winner_id: m.winner_id,
        status: m.status
      })));

      await supabase.from('standings').upsert(
        standings.map((standing) => ({
          tournament_id: match.tournament_id,
          group_id: match.group_id,
          user_id: standing.player_id,
          division: match.division ?? null,
          points: standing.points,
          tie_break: standing.tie_break,
          wins: standing.wins,
          losses: standing.losses,
          draws: standing.draws,
          opponents: standing.opponents
        }))
      );
    }

    await logAdminAction(user.id, 'update_score', matchId, { score1, score2, status, winner_id: winnerId });

    const { data: recipients } = await supabase
      .from('users')
      .select('email')
      .in('id', [match.player1_id, match.player2_id].filter(Boolean));
    const template = buildNotificationTemplate('result_notification', {});
    await Promise.all((recipients ?? []).map((recipient) => sendEmail({ to: recipient.email, subject: template.subject, html: template.html })));

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
