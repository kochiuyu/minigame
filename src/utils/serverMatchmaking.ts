// Server-side matchmaking simulation for classroom games

const SERVER_ROSTER = [
  'Morgan C. (ShadowFox)',
  'Jordan T. (GameFox)',
  'Sam P. (VickreyAce)',
  'Taylor B. (MatrixWolf)',
  'Casey L. (ParetoStar)',
  'Alex R. (AlphaStrategist)',
  'Chris M. (QuietOwl)',
  'Jamie D. (PayoffHunter)'
];

export interface HistoryRound {
  round: number;
  myChoice?: string;
  partnerChoice?: string;
}

export interface ServerMatch {
  partnerAlias: string;
  tableNumber: number;
  partnerChoice?: string;
  partnerBids?: number[];
  partnerDemand?: number;
  partnerStrategy?: string;
  triggerActivated?: boolean;
  trustStreak?: number;
}

export function getServerMatch(
  weekId: number,
  roundNum: number,
  userSeed: string = '',
  history: HistoryRound[] = []
): ServerMatch {
  // Deterministic seed offset based on user to ensure unique partner assignment per student
  const hash = userSeed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  if (weekId === 1) {
    // Week 1: Rotating new partner every round as per game instructions ("Find a NEW partner for the next round!")
    const partnerIndex = (roundNum - 1 + hash) % SERVER_ROSTER.length;
    const partnerAlias = SERVER_ROSTER[partnerIndex];

    // Standard classroom distribution for Prisoner's Dilemma (~60% coop in early rounds, decaying in later rounds)
    const coopProbability = roundNum === 1 ? 0.75 : roundNum === 2 ? 0.65 : roundNum <= 4 ? 0.5 : 0.35;
    const partnerChoice = Math.random() < coopProbability ? 'Cooperate' : 'Defect';

    return {
      partnerAlias,
      tableNumber: ((partnerIndex % 8) + 1),
      partnerChoice
    };
  }

  if (weekId === 6) {
    // Week 6: Repeated Game with the SAME partner across all rounds!
    const partnerIndex = hash % SERVER_ROSTER.length;
    const partnerAlias = SERVER_ROSTER[partnerIndex];

    // Inspect history up to this round
    const pastCompleted = history.filter(h => h.round < roundNum && h.myChoice);
    const hasDefected = pastCompleted.some(h => h.myChoice === 'Defect');
    const partnerHasDefected = pastCompleted.some(h => h.partnerChoice === 'Defect');
    const triggerActivated = hasDefected || partnerHasDefected;

    // Count consecutive mutual cooperation rounds
    let trustStreak = 0;
    for (let i = pastCompleted.length - 1; i >= 0; i--) {
      if (pastCompleted[i].myChoice === 'Cooperate' && pastCompleted[i].partnerChoice === 'Cooperate') {
        trustStreak++;
      } else {
        break;
      }
    }

    let partnerChoice = 'Cooperate';
    if (roundNum === 1) {
      // In Axelrod's tournaments, winning strategies (like Tit-for-Tat) ALWAYS start cooperative
      partnerChoice = 'Cooperate';
    } else {
      const lastRound = pastCompleted[pastCompleted.length - 1];
      if (lastRound?.myChoice === 'Defect') {
        // Retaliation: Student defected in previous round -> Partner retaliates with Defect
        partnerChoice = 'Defect';
      } else if (lastRound?.myChoice === 'Cooperate') {
        // Student cooperated in previous round
        if (!hasDefected) {
          // Mutual trust is unbroken
          // In the final round of a known 6-round finite game, test backward induction endgame defection
          if (roundNum >= 6 && Math.random() < 0.25) {
            partnerChoice = 'Defect'; // Endgame temptation
          } else {
            partnerChoice = 'Cooperate';
          }
        } else {
          // Student previously defected, but cooperated in the last round:
          // Tit-for-Tat forgives when student returns to cooperation (85% forgiveness rate)
          partnerChoice = Math.random() < 0.85 ? 'Cooperate' : 'Defect';
        }
      }
    }

    return {
      partnerAlias,
      tableNumber: ((partnerIndex % 8) + 1),
      partnerChoice,
      partnerStrategy: 'Tit-for-Tat (Reactive)',
      triggerActivated,
      trustStreak
    };
  }

  if (weekId === 3) {
    // Simultaneous Pricing
    const partnerIndex = (roundNum + hash) % SERVER_ROSTER.length;
    return {
      partnerAlias: SERVER_ROSTER[partnerIndex],
      tableNumber: ((partnerIndex % 8) + 1),
      partnerChoice: Math.random() < 0.65 ? 'Low Price' : 'High Price'
    };
  }

  if (weekId === 4) {
    // Promotion Day
    const partnerIndex = hash % SERVER_ROSTER.length;
    const days = ['Monday', 'Wednesday', 'Friday'];
    return {
      partnerAlias: SERVER_ROSTER[partnerIndex],
      tableNumber: ((partnerIndex % 8) + 1),
      partnerChoice: days[Math.floor(Math.random() * days.length)]
    };
  }

  // Default fallback
  const partnerIndex = (roundNum + hash) % SERVER_ROSTER.length;
  return {
    partnerAlias: SERVER_ROSTER[partnerIndex],
    tableNumber: ((partnerIndex % 8) + 1)
  };
}
