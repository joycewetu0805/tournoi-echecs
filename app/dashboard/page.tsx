import { Section } from '@/components/layout/Section';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Timeline } from '@/components/layout/Timeline';
import { StatsPanel } from '@/components/stats/StatsPanel';

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-chess">
      <Section className="grid gap-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <Badge>Espace Joueur</Badge>
            <h2 className="mt-4 text-2xl font-semibold">Tableau d'analyse personnel</h2>
          </div>
          <div className="max-w-full">
            <Timeline current={1} />
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="p-6">
            <p className="text-xs uppercase tracking-widest text-steel-500">Statut inscription</p>
            <p className="mt-4 text-xl font-semibold text-accent-400">En validation</p>
            <p className="mt-2 text-sm text-steel-400">Votre paiement est en cours de verification.</p>
          </Card>
          <Card className="p-6">
            <p className="text-xs uppercase tracking-widest text-steel-500">ELO actuel</p>
            <p className="mt-4 text-3xl font-semibold">1284</p>
            <p className="mt-2 text-sm text-steel-400">Division B</p>
          </Card>
          <Card className="p-6">
            <p className="text-xs uppercase tracking-widest text-steel-500">Match suivant</p>
            <p className="mt-4 text-xl font-semibold">Samedi 11:20</p>
            <p className="mt-2 text-sm text-steel-400">Court 2 · Pool C</p>
          </Card>
        </div>
        <Card className="p-6 md:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <Badge>Poule actuelle</Badge>
              <h3 className="mt-4 text-xl font-semibold">Pool C</h3>
            </div>
            <span className="text-xs uppercase tracking-widest text-steel-500">Classement provisoire</span>
          </div>
          <div className="mt-6 grid gap-3 text-sm">
            <div className="flex justify-between border-b border-white/5 pb-2">
              <span>1. Lina K.</span>
              <span className="text-accent-400">2 pts</span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-2">
              <span>2. Amir S.</span>
              <span className="text-accent-400">1 pt</span>
            </div>
            <div className="flex justify-between">
              <span>3. Vous</span>
              <span className="text-accent-400">0.5 pt</span>
            </div>
          </div>
        </Card>
        <StatsPanel />
      </Section>
    </main>
  );
}
