export function calculateReturnRate(totalPlayers: number, returningPlayers: number) {
  if (totalPlayers === 0) return 0;
  return Math.round((returningPlayers / totalPlayers) * 1000) / 10;
}

export function detectDominance(winRate: number) {
  return winRate > 0.6;
}

export function distributionGains(gains: number[]) {
  const total = gains.reduce((sum, gain) => sum + gain, 0);
  if (total === 0) return [];
  return gains.map((gain) => Math.round((gain / total) * 1000) / 10);
}
