import { Section } from '@/components/layout/Section';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-chess">
      <Section className="grid gap-8 md:grid-cols-[1.1fr_0.9fr]">
        <Card className="p-6 md:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <Badge>Inscription</Badge>
            <span className="text-xs uppercase tracking-widest text-steel-500">Lun 00h - Ven 22h</span>
          </div>
          <h2 className="mt-6 text-2xl font-semibold">Tournoi du samedi</h2>
          <p className="mt-2 text-steel-400">Frais d'inscription: 10 USD. Paiement M-Pesa RDC, validation admin.</p>
          <form className="mt-6 grid gap-4">
            <input className="rounded-xl border border-white/10 bg-base-800 px-4 py-3 text-sm" placeholder="Nom complet" />
            <input className="rounded-xl border border-white/10 bg-base-800 px-4 py-3 text-sm" placeholder="Email universitaire" />
            <Button type="submit">Demander l'inscription</Button>
          </form>
        </Card>
        <Card className="p-6 md:p-8">
          <Badge>Reglement</Badge>
          <ul className="mt-6 space-y-3 text-sm text-steel-300">
            <li>Cadence: 15 min + 10 sec.</li>
            <li>Pause officielle 13h00 - 13h30.</li>
            <li>Retard &gt; 10 minutes: forfait.</li>
            <li>Top 2 de chaque poule qualifie pour les quarts.</li>
          </ul>
          <Button variant="ghost" className="mt-6 w-full">Lire le reglement complet</Button>
        </Card>
      </Section>
    </main>
  );
}
