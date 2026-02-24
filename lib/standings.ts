export type MatchResult = {
  player1_id: string;
  player2_id: string | null;
  score1: number | null;
  score2: number | null;
  winner_id: string | null;
  status: 'scheduled' | 'completed' | 'forfeit' | 'draw';
};

export type Standing = {
  player_id: string;
  points: number;
  wins: number;
  draws: number;
  losses: number;
  tie_break: number;
  opponents: string[];
};

export function computeStandings(players: string[], matches: MatchResult[]): Standing[] {
  const standings = new Map<string, Standing>();
  players.forEach((playerId) => {
    standings.set(playerId, {
      player_id: playerId,
      points: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      tie_break: 0,
      opponents: []
    });
  });

  matches.forEach((match) => {
    if (!match.player2_id) {
      const standing = standings.get(match.player1_id);
      if (standing) {
        standing.points += 1;
        standing.wins += 1;
      }
      return;
    }

    const p1 = standings.get(match.player1_id);
    const p2 = standings.get(match.player2_id);
    if (!p1 || !p2) return;

    p1.opponents.push(match.player2_id);
    p2.opponents.push(match.player1_id);

    if (match.status === 'completed') {
      if (match.winner_id === match.player1_id) {
        p1.points += 1;
        p1.wins += 1;
        p2.losses += 1;
      } else if (match.winner_id === match.player2_id) {
        p2.points += 1;
        p2.wins += 1;
        p1.losses += 1;
      } else {
        p1.points += 0.5;
        p2.points += 0.5;
        p1.draws += 1;
        p2.draws += 1;
      }
    }

    if (match.status === 'forfeit') {
      if (match.winner_id === match.player1_id) {
        p1.points += 1;
        p1.wins += 1;
        p2.losses += 1;
      } else if (match.winner_id === match.player2_id) {
        p2.points += 1;
        p2.wins += 1;
        p1.losses += 1;
      }
    }
  });

  const standingsArray = Array.from(standings.values());
  standingsArray.forEach((standing) => {
    standing.tie_break = standing.opponents.length;
  });

  return standingsArray.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    return b.tie_break - a.tie_break;
  });
}
