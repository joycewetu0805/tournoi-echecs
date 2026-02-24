import Link from 'next/link';
import { Section } from '@/components/layout/Section';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CreateTournamentForm } from '@/components/admin/CreateTournamentForm';

export default function CreateTournamentPage() {
  return (
    <main className="min-h-screen bg-chess">
      <Section className="grid gap-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Badge>Administration</Badge>
            <h2 className="mt-4 text-2xl font-semibold">Creer un tournoi</h2>
          </div>
          <Link href="/admin">
            <Button variant="ghost">Retour admin</Button>
          </Link>
        </div>
        <Card className="p-6 md:p-8">
          <p className="text-sm text-steel-400">
            Si aucune date n'est indiquee, le systeme cree automatiquement le prochain samedi.
          </p>
          <div className="mt-6">
            <CreateTournamentForm />
          </div>
        </Card>
      </Section>
    </main>
  );
}
