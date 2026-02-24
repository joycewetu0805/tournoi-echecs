import { isUpset } from './elo';

export function calculateBestProgression(players: { id: string; eloBefore: number; eloAfter: number }[]) {
  return players.sort((a, b) => (b.eloAfter - b.eloBefore) - (a.eloAfter - a.eloBefore))[0];
}

export function calculateUpsetAward(results: { winnerId: string; winnerElo: number; loserElo: number }[]) {
  return results.find((result) => isUpset(result.winnerElo, result.loserElo));
}
