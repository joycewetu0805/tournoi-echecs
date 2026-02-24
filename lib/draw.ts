import crypto from 'crypto';
import { createSwissPairings } from './swiss';

export type PlayerSeed = {
  id: string;
  elo: number;
  division: 'A' | 'B';
};

export type Group = {
  name: string;
  players: PlayerSeed[];
};

export function secureShuffle<T>(input: T[]): T[] {
  const arr = [...input];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = crypto.randomInt(0, i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function createGroups(players: PlayerSeed[], groupCount: number, seeding: 'random' | 'elo' = 'random'): Group[] {
  const ordered = seeding === 'elo'
    ? [...players].sort((a, b) => b.elo - a.elo)
    : secureShuffle(players);
  const groups: Group[] = Array.from({ length: groupCount }, (_, index) => ({
    name: `Pool ${String.fromCharCode(65 + index)}`,
    players: []
  }));

  ordered.forEach((player, index) => {
    if (seeding === 'elo') {
      const cycle = index % (groupCount * 2);
      const target = cycle < groupCount ? cycle : groupCount * 2 - 1 - cycle;
      groups[target].players.push(player);
      return;
    }
    groups[index % groupCount].players.push(player);
  });

  return groups;
}

export function resolveFormat(playerCount: number, preferSwiss = true) {
  if (preferSwiss && playerCount >= 10) return 'swiss';
  if (playerCount >= 6 && playerCount <= 8) return 'round_robin';
  if (playerCount >= 9 && playerCount <= 16) return 'pools';
  return 'manual';
}

export function generateRoundRobinMatches(groupId: string, players: PlayerSeed[]) {
  const matches = [] as {
    group_id: string;
    round_type: 'pool';
    player1_id: string;
    player2_id: string;
  }[];

  for (let i = 0; i < players.length; i += 1) {
    for (let j = i + 1; j < players.length; j += 1) {
      matches.push({
        group_id: groupId,
        round_type: 'pool',
        player1_id: players[i].id,
        player2_id: players[j].id
      });
    }
  }

  return matches;
}

export function generateSwissRound(players: PlayerSeed[], standings: { id: string; score: number; opponents: string[] }[]) {
  const swissPlayers = players.map((player) => {
    const standing = standings.find((s) => s.id === player.id);
    return {
      id: player.id,
      score: standing?.score ?? 0,
      elo: player.elo,
      opponents: standing?.opponents ?? []
    };
  });
  return createSwissPairings(swissPlayers);
}

export function generateKnockoutSeeds(qualified: PlayerSeed[]) {
  const sorted = [...qualified].sort((a, b) => b.elo - a.elo);
  const matches: { player1_id: string; player2_id: string }[] = [];
  for (let i = 0; i < sorted.length; i += 2) {
    matches.push({
      player1_id: sorted[i].id,
      player2_id: sorted[i + 1]?.id ?? null
    });
  }
  return matches;
}
