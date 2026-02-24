import { Section } from '@/components/layout/Section';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BracketTree, BracketNode } from '@/components/bracket/BracketTree';
import { Timeline } from '@/components/layout/Timeline';

const sampleBracket: BracketNode = {
  id: 'final',
  label: 'Finale',
  score: '2-1',
  highlight: true,
  children: [
    {
      id: 'semi-1',
      label: 'Demi 1',
      score: '1-0',
      children: [
        { id: 'q1', label: 'Quart 1', score: '1-0' },
        { id: 'q2', label: 'Quart 2', score: '0-1' }
      ]
    },
    {
      id: 'semi-2',
      label: 'Demi 2',
      score: '1-0',
      children: [
        { id: 'q3', label: 'Quart 3', score: '1-0' },
        { id: 'q4', label: 'Quart 4', score: '1-0' }
      ]
    }
  ]
};

export default function TournamentPage() {
  return (
    <main className="min-h-screen bg-chess">
      <Section className="grid gap-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <Badge>Tournoi Live</Badge>
            <h2 className="mt-4 text-2xl font-semibold">Phase en cours</h2>
          </div>
          <div className="text-left md:text-right">
            <p className="text-xs uppercase tracking-widest text-steel-500">Timer officiel</p>
            <p className="mt-2 text-lg text-accent-400">11:42 · Samedi</p>
          </div>
        </div>
        <Card className="p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest text-steel-500">Timeline</p>
              <Timeline current={2} />
            </div>
            <div className="text-left md:text-right">
              <p className="text-xs uppercase tracking-widest text-steel-500">Pause officielle</p>
              <p className="mt-2 text-sm">13h00 - 13h30</p>
            </div>
          </div>
        </Card>
        <Card className="p-6 md:p-8">
          <h3 className="text-lg font-semibold">Bracket strategique</h3>
          <p className="mt-2 text-sm text-steel-400">Mise a jour en temps reel apres validation admin.</p>
          <div className="mt-6">
            <BracketTree data={sampleBracket} />
          </div>
        </Card>
      </Section>
    </main>
  );
}
