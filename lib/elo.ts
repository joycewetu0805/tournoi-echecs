export function expectedScore(eloA: number, eloB: number) {
  return 1 / (1 + Math.pow(10, (eloB - eloA) / 400));
}

export function updateElo(eloA: number, eloB: number, resultA: number, k = 24) {
  const expectedA = expectedScore(eloA, eloB);
  const deltaA = Math.round(k * (resultA - expectedA));
  return {
    newA: eloA + deltaA,
    newB: eloB - deltaA,
    deltaA
  };
}

export function computeEloDelta(eloA: number, eloB: number, resultA: number, k: number) {
  const expectedA = expectedScore(eloA, eloB);
  return Math.round(k * (resultA - expectedA));
}

export function isUpset(winElo: number, loseElo: number) {
  return winElo + 50 < loseElo;
}
