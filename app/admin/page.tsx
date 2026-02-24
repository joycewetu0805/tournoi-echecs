import { Section } from '@/components/layout/Section';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Table, Th, Td } from '@/components/ui/table';

export default function AdminPage() {
  return (
    <main className="min-h-screen bg-chess">
      <Section className="grid gap-8">
        <div className="flex items-center justify-between">
          <div>
            <Badge>Administration</Badge>
            <h2 className="mt-4 text-2xl font-semibold">Console de controle</h2>
          </div>
          <div className="flex gap-3">
            <Link href="/admin/tournaments">
              <Button variant="ghost">Creer un tournoi</Button>
            </Link>
            <Button variant="ghost">Publier la liste</Button>
            <Button>Lancer le tirage</Button>
          </div>
        </div>
        <Card className="p-6">
          <h3 className="text-lg font-semibold">Paiements M-Pesa a valider</h3>
          <Table className="mt-4">
            <thead>
              <tr className="table-row">
                <Th>Joueur</Th>
                <Th>Montant</Th>
                <Th>Statut</Th>
                <Th>Action</Th>
              </tr>
            </thead>
            <tbody>
              {['Amir', 'Lina', 'Sofiane'].map((name) => (
                <tr key={name} className="table-row">
                  <Td>{name}</Td>
                  <Td>10 USD</Td>
                  <Td className="text-accent-400">En attente</Td>
                  <Td>
                    <Button className="text-xs">Valider</Button>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
        <Card className="p-6">
          <h3 className="text-lg font-semibold">Saisie des scores</h3>
          <div className="mt-4 grid gap-3 text-sm">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <span>Pool C · Match 2</span>
              <span className="text-accent-400">En attente</span>
              <Button variant="ghost" className="text-xs">Entrer score</Button>
            </div>
            <div className="flex items-center justify-between">
              <span>Quarterfinal 1</span>
              <span className="text-steel-500">Verrouille</span>
              <Button variant="ghost" className="text-xs" disabled>
                Verrouille
              </Button>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <h3 className="text-lg font-semibold">Pilotage financier</h3>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-xs uppercase tracking-widest text-steel-500">Revenu total</p>
              <p className="mt-2 text-xl text-accent-400">1 240 USD</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-steel-500">Prize pool (70%)</p>
              <p className="mt-2 text-xl">868 USD</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-steel-500">Organisation (30%)</p>
              <p className="mt-2 text-xl">372 USD</p>
            </div>
          </div>
          <Button variant="ghost" className="mt-6">Exporter CSV</Button>
        </Card>
        <Card className="p-6">
          <h3 className="text-lg font-semibold">Equilibre competitif</h3>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-xs uppercase tracking-widest text-steel-500">Taux de retour</p>
              <p className="mt-2 text-xl text-accent-400">68%</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-steel-500">Dominance</p>
              <p className="mt-2 text-xl">Aucun joueur &gt; 60%</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-steel-500">Suggestion</p>
              <p className="mt-2 text-sm text-steel-300">Activer divisions pour equilibrer les gains.</p>
            </div>
          </div>
        </Card>
      </Section>
    </main>
  );
}
