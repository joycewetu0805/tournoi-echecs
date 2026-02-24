export type SwissPlayer = {
  id: string;
  score: number;
  elo: number;
  opponents: string[];
};

export type Pairing = {
  player1_id: string | null;
  player2_id: string | null;
  is_bye?: boolean;
};

export function createSwissPairings(players: SwissPlayer[]): Pairing[] {
  const sorted = [...players].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return b.elo - a.elo;
  });

  const used = new Set<string>();
  const pairings: Pairing[] = [];

  for (let i = 0; i < sorted.length; i++) {
    const player = sorted[i];
    if (used.has(player.id)) continue;
    used.add(player.id);

    const opponentIndex = sorted.findIndex((candidate) => {
      if (used.has(candidate.id)) return false;
      if (candidate.id === player.id) return false;
      return !player.opponents.includes(candidate.id);
    });

    if (opponentIndex === -1) {
      pairings.push({ player1_id: player.id, player2_id: null, is_bye: true });
      continue;
    }

    const opponent = sorted[opponentIndex];
    used.add(opponent.id);
    pairings.push({ player1_id: player.id, player2_id: opponent.id });
  }

  return pairings;
}
