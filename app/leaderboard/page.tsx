import { Section } from '@/components/layout/Section';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, Th, Td } from '@/components/ui/table';
import { createSupabaseServiceClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function LeaderboardPage() {
  const supabase = createSupabaseServiceClient();
  const { data: players } = await supabase
    .from('users')
    .select('id, email, elo, matches_played')
    .order('elo', { ascending: false })
    .limit(50);

  return (
    <main className="min-h-screen bg-chess">
      <Section className="grid gap-8">
        <div>
          <Badge>Classement General</Badge>
          <h2 className="mt-4 text-2xl font-semibold">Top joueurs</h2>
          <p className="mt-2 text-sm text-steel-400">Classement interne base sur l'ELO.</p>
        </div>
        <Card className="p-6">
          <Table>
            <thead>
              <tr className="table-row">
                <Th>Rang</Th>
                <Th>Joueur</Th>
                <Th>ELO</Th>
                <Th>Matches</Th>
              </tr>
            </thead>
            <tbody>
              {(players ?? []).map((player, index) => (
                <tr key={player.id} className="table-row">
                  <Td>#{index + 1}</Td>
                  <Td>{player.email ?? 'Joueur'}</Td>
                  <Td className="text-accent-400">{player.elo}</Td>
                  <Td>{player.matches_played}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
      </Section>
    </main>
  );
}
