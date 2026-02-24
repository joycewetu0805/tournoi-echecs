export function calculatePrizePool(totalPayments: number) {
  const prizePool = Math.round(totalPayments * 0.7 * 100) / 100;
  const organization = Math.round(totalPayments * 0.3 * 100) / 100;
  return { prizePool, organization };
}

export function calculateMonthlyPool(totalPayments: number) {
  return Math.round(totalPayments * 0.1 * 100) / 100;
}

export function splitPrizePoolByDivision(prizePool: number, divisionACount: number, divisionBCount: number) {
  const total = divisionACount + divisionBCount || 1;
  return {
    divisionA: Math.round((prizePool * divisionACount) / total * 100) / 100,
    divisionB: Math.round((prizePool * divisionBCount) / total * 100) / 100
  };
}

export function isCashbackEligible(consecutiveParticipations: number, podiumCount: number) {
  return consecutiveParticipations >= 4 && podiumCount === 0;
}
