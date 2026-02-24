import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { createSupabaseServiceClient } from '@/lib/supabase/server';
import { assertAfterRegistrationClose } from '@/lib/time';
import { logAdminAction } from '@/lib/audit';
import { buildNotificationTemplate, sendEmail } from '@/lib/notifications';
import { createGroups, generateRoundRobinMatches, generateSwissRound, resolveFormat, secureShuffle } from '@/lib/draw';
import { enforceRateLimit } from '@/lib/rateLimit';

export async function POST(request: Request) {
  try {
    await enforceRateLimit('admin-draw');
    const { user } = await requireAdmin();
    assertAfterRegistrationClose();

    const body = await request.json().catch(() => ({}));

    const supabase = createSupabaseServiceClient();
    const { data: tournament } = await supabase
      .from('tournaments')
      .select('*')
      .eq('status', 'registration')
      .order('date', { ascending: false })
      .limit(1)
      .single();

    if (!tournament) {
      return NextResponse.json({ error: 'NO_ACTIVE_TOURNAMENT' }, { status: 400 });
    }

    const { data: registrations } = await supabase
      .from('registrations')
      .select('user_id, division')
      .eq('tournament_id', tournament.id)
      .eq('payment_status', 'validated');

    const { data: players } = await supabase
      .from('users')
      .select('id, elo')
      .in('id', registrations?.map((r) => r.user_id) ?? []);

    const seeds = (players ?? []).map((player) => {
      const reg = registrations?.find((r) => r.user_id === player.id);
      return {
        id: player.id,
        elo: player.elo ?? 1200,
        division: reg?.division ?? ((player.elo ?? 1200) > 1300 ? 'A' : 'B')
      };
    });

    const preferSwiss = body.prefer_swiss ?? true;
    const enableDivisions = body.enable_divisions ?? true;
    const seeding = (body.seeding as 'random' | 'elo' | undefined) ?? 'random';

    const divisions = enableDivisions
      ? {
          A: seeds.filter((seed) => seed.division === 'A'),
          B: seeds.filter((seed) => seed.division === 'B')
        }
      : { A: seeds };

    const formatsUsed = new Set<string>();

    for (const [division, divisionSeeds] of Object.entries(divisions)) {
      if (divisionSeeds.length === 0) continue;

      const format = body.format ?? resolveFormat(divisionSeeds.length, preferSwiss);
      formatsUsed.add(format);

      if (format === 'round_robin') {
        const group = await supabase
          .from('groups')
          .insert({ tournament_id: tournament.id, name: `Round Robin ${division}`, division })
          .select('*')
          .single();
        const matches = generateRoundRobinMatches(group.data.id, divisionSeeds);
        await supabase.from('matches').insert(
          matches.map((match) => ({
            tournament_id: tournament.id,
            group_id: match.group_id,
            round_type: 'pool',
            division,
            player1_id: match.player1_id,
            player2_id: match.player2_id
          }))
        );
      }

      if (format === 'pools') {
        const groupCount = Math.max(2, Math.ceil(divisionSeeds.length / 3));
        const groups = createGroups(divisionSeeds, groupCount, seeding);
        const insertedGroups = await supabase
          .from('groups')
          .insert(groups.map((group) => ({ tournament_id: tournament.id, name: `${group.name} ${division}`, division })))
          .select('*');

        const matches = insertedGroups.data
          ?.map((group, index) => generateRoundRobinMatches(group.id, groups[index].players))
          .flat();

        if (matches && matches.length > 0) {
          await supabase.from('matches').insert(
            matches.map((match) => ({
              tournament_id: tournament.id,
              group_id: match.group_id,
              round_type: 'pool',
              division,
              player1_id: match.player1_id,
              player2_id: match.player2_id
            }))
          );
        }
      }

      if (format === 'swiss') {
        const swissSeeds = seeding === 'random' ? secureShuffle(divisionSeeds) : divisionSeeds;
        const pairings = generateSwissRound(swissSeeds, []);
        await supabase.from('matches').insert(
          pairings.map((pairing) => ({
            tournament_id: tournament.id,
            round_type: 'swiss',
            round_no: 1,
            division,
            player1_id: pairing.player1_id,
            player2_id: pairing.player2_id,
            status: pairing.is_bye ? 'completed' : 'scheduled'
          }))
        );
      }
    }

    await supabase
      .from('tournaments')
      .update({ status: 'pool', format: formatsUsed.values().next().value ?? 'pools', swiss_rounds: 3, divisions_enabled: enableDivisions })
      .eq('id', tournament.id);

    const template = buildNotificationTemplate('draw_published', {});
    const { data: recipients } = await supabase.from('users').select('email').in('id', seeds.map((seed) => seed.id));
    await Promise.all((recipients ?? []).map((recipient) => sendEmail({ to: recipient.email, subject: template.subject, html: template.html })));

    await logAdminAction(user.id, 'generate_draw', tournament.id, { formats: Array.from(formatsUsed), total_players: seeds.length });

    return NextResponse.json({ ok: true, formats: Array.from(formatsUsed), players: seeds.length });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
