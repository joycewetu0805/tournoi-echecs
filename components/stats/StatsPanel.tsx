'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

type HistoryPoint = {
  created_at: string;
  after_elo: number;
};

type Stats = {
  wins: number;
  losses: number;
  draws: number;
  ratio: number;
  history: HistoryPoint[];
};

export function StatsPanel() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    let active = true;
    fetch('/api/player/stats')
      .then((res) => res.json())
      .then((data) => {
        if (!active) return;
        if (data.error) return;
        setStats(data);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  const history = stats?.history?.slice(-6) ?? [];
  const values = history.map((point) => point.after_elo);
  const min = values.length ? Math.min(...values) : 0;
  const max = values.length ? Math.max(...values) : 1;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <Badge>Statistiques Joueur</Badge>
          <h3 className="mt-4 text-xl font-semibold">Performance recente</h3>
        </div>
        <div className="text-right">
          <p className="text-xs uppercase tracking-widest text-steel-500">Ratio</p>
          <p className="mt-2 text-2xl text-accent-400">{stats ? `${stats.ratio}%` : '--'}</p>
        </div>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <div>
          <p className="text-xs uppercase tracking-widest text-steel-500">Victoires</p>
          <p className="mt-2 text-xl">{stats?.wins ?? '--'}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-widest text-steel-500">Defaites</p>
          <p className="mt-2 text-xl">{stats?.losses ?? '--'}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-widest text-steel-500">Nulles</p>
          <p className="mt-2 text-xl">{stats?.draws ?? '--'}</p>
        </div>
      </div>
      <div className="mt-6">
        <p className="text-xs uppercase tracking-widest text-steel-500">Progression ELO</p>
        <div className="mt-3 flex h-20 items-end gap-2">
          {history.length === 0 && <span className="text-sm text-steel-500">Pas encore de donnees.</span>}
          {history.map((point) => {
            const height = max === min ? 40 : 20 + ((point.after_elo - min) / (max - min)) * 60;
            return (
              <div key={point.created_at} className="flex flex-col items-center gap-2">
                <div className="w-4 rounded-full bg-accent-400" style={{ height }} />
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
