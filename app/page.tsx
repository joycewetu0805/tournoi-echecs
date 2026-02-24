import Link from 'next/link';
import { Section } from '@/components/layout/Section';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function Home() {
  return (
    <main className="min-h-screen bg-chess">
      <Section className="flex flex-col gap-10">
        <div className="flex items-center justify-between">
          <Badge>Tournoi Hebdomadaire</Badge>
          <div className="flex gap-3">
            <Link href="/tournament" className="button-ghost">Tournoi</Link>
            <Link href="/leaderboard" className="button-ghost">Classement</Link>
            <Link href="/register" className="button-primary">Inscription</Link>
          </div>
        </div>
        <div className="card p-10">
          <h1 className="text-4xl font-semibold text-steel-100">Laboratoire strategique d'echecs universitaire</h1>
          <p className="mt-4 max-w-2xl text-steel-300">
            Une plateforme noire, institutionnelle et competitive. Inscription de lundi 00h a vendredi 22h, tirage
            automatique, progression ELO et recompenses mensuelles.
          </p>
          <div className="mt-8 flex gap-3">
            <Link href="/dashboard" className="button-ghost">Espace joueur</Link>
            <Link href="/admin" className="button-primary">Console admin</Link>
          </div>
        </div>
      </Section>
    </main>
  );
}
