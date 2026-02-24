'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

export function CreateTournamentForm() {
  const [date, setDate] = useState('');
  const [format, setFormat] = useState<'pools' | 'round_robin' | 'swiss'>('pools');
  const [divisionsEnabled, setDivisionsEnabled] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    const response = await fetch('/api/admin/tournaments/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        date: date || undefined,
        format,
        divisions_enabled: divisionsEnabled
      })
    });

    const data = await response.json();
    setLoading(false);
    if (!response.ok) {
      setMessage(data.error ?? 'Erreur inconnue');
      return;
    }

    setMessage(`Tournoi cree pour le ${data.tournament.date}.`);
    setDate('');
  };

  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      <label className="grid gap-2 text-sm text-steel-300">
        Date du tournoi (optionnel)
        <input
          type="date"
          className="rounded-xl border border-white/10 bg-base-800 px-4 py-3 text-sm"
          value={date}
          onChange={(event) => setDate(event.target.value)}
        />
      </label>
      <label className="grid gap-2 text-sm text-steel-300">
        Format
        <select
          className="rounded-xl border border-white/10 bg-base-800 px-4 py-3 text-sm"
          value={format}
          onChange={(event) => setFormat(event.target.value as 'pools' | 'round_robin' | 'swiss')}
        >
          <option value="pools">Poules</option>
          <option value="round_robin">Round Robin</option>
          <option value="swiss">Swiss</option>
        </select>
      </label>
      <label className="flex items-center gap-3 text-sm text-steel-300">
        <input
          type="checkbox"
          className="h-4 w-4"
          checked={divisionsEnabled}
          onChange={(event) => setDivisionsEnabled(event.target.checked)}
        />
        Divisions A/B actives
      </label>
      <Button type="submit" disabled={loading}>
        {loading ? 'Creation...' : 'Creer le tournoi'}
      </Button>
      {message && <p className="text-sm text-accent-400">{message}</p>}
    </form>
  );
}
