import { WeekConfig, RoundData } from '../types';
import { generateNickname } from './nicknameGenerator';
import { resolveAuction } from './auctionEngine';

export const SAMPLE_STUDENT_NAMES = [
  'Alex Rivera',
  'Jordan Chen',
  'Taylor Brooks',
  'Samira Khan',
  'Morgan Reed',
  'Casey Patel',
  'Riley Zhang',
  'Avery Morales',
  'Marcus Vance',
  'Elena Rostova',
  'Chloe Bennett',
  'Lucas Silva',
  'Maya Lin',
  'David Kim',
  'Priya Sharma',
  'Devon Washington',
  'Kai Takahashi',
  'Noah Andersen'
];

export interface GeneratedStudent {
  name: string;
  id: string;
  alias: string;
  roomCode: string;
}

/**
 * Generates a completely fresh, randomized student profile
 */
export function generateFreshSampleStudent(): GeneratedStudent {
  const name = SAMPLE_STUDENT_NAMES[Math.floor(Math.random() * SAMPLE_STUDENT_NAMES.length)];
  const randomSuffix = Math.floor(100 + Math.random() * 900);
  const id = `3090${randomSuffix}`;
  // Fresh random nickname (unseeded for maximum variety)
  const alias = generateNickname();
  return {
    name,
    id,
    alias,
    roomCode: 'DOTE-3090'
  };
}

/**
 * Generates random gameplay data for a single round according to the week's rules
 */
export function generateRandomRoundData(
  week: WeekConfig,
  roundNum: number,
  totalRounds: number,
  studentAlias: string,
  history: { round: number; myChoice?: string; partnerChoice?: string }[] = []
): RoundData {
  const now = new Date();
  const timeStr = new Date(now.getTime() - (totalRounds - roundNum) * 45000).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  const partnerAliases = [
    'CleverFalcon_42',
    'SwiftFox_19',
    'QuantumWolf_88',
    'SolarOtter_33',
    'SilverHawk_71',
    'CosmicLynx_15',
    'WiseTiger_64',
    'BrightPanda_50'
  ];

  // Pick or maintain partner alias
  let partnerAlias1 = partnerAliases[(roundNum * 3 + studentAlias.length) % partnerAliases.length];
  if (week.id === 6) {
    // Fixed partner for repeated game
    partnerAlias1 = 'FixedPartner_TFT';
  }

  const baseData: RoundData = {
    partnerAlias1,
    isStep1Locked: true,
    step1Time: timeStr,
    isStep2Locked: true,
    step2Time: timeStr
  };

  // Week 7: Second-Price Sealed-Bid Auction
  if (week.id === 7) {
    // Random valuation uniformly distributed 1 to 10
    const valuation = Math.floor(Math.random() * 10) + 1;
    // Bidding strategy: 60% truthful, 20% shaded, 20% overbid
    const bidType = Math.random();
    let myBid = valuation;
    if (bidType < 0.6) {
      myBid = valuation; // Truthful
    } else if (bidType < 0.8) {
      myBid = Math.max(0.5, Math.round((valuation - 0.5 - Math.random()) * 2) / 2); // Underbid
    } else {
      myBid = Math.round((valuation + 0.5 + Math.random()) * 2) / 2; // Overbid
    }

    const res = resolveAuction(
      valuation,
      myBid,
      roundNum,
      studentAlias,
      'second_price',
      3,
      1,
      10
    );

    return {
      ...baseData,
      drawnValuation: valuation,
      myBid: myBid,
      clearingPrice: res.clearingPrice,
      winningBid: res.highestBid,
      winnerAlias: res.winnerAlias,
      isWinner: res.isStudentWinner ? 'true' : 'false',
      profit: res.profit,
      competitorsBids: JSON.stringify(res.allBids)
    };
  }

  // Week 8: First-Price Auction / Winner's Curse
  if (week.id === 8) {
    const trueVal = 8 + Math.floor(Math.random() * 8); // 8 to 15
    const myBid = Math.round((trueVal * 0.75 + (Math.random() * 2 - 1)) * 2) / 2;
    const bid2 = Math.round((trueVal * 0.75 + (Math.random() * 2 - 1)) * 2) / 2;
    const bid3 = Math.round((trueVal * 0.75 + (Math.random() * 2 - 1)) * 2) / 2;
    const bid4 = Math.round((trueVal * 0.75 + (Math.random() * 2 - 1)) * 2) / 2;

    return {
      ...baseData,
      partnerAlias2: 'Bidder_Beta',
      partnerAlias3: 'Bidder_Gamma',
      rule: Math.random() < 0.5 ? 'Independent (Silent)' : 'Collusion Allowed',
      myBid,
      bid2,
      bid3,
      bid4,
      trueValue: trueVal
    };
  }

  // Week 1 & 6: Prisoner's Dilemma / Repeated Game
  if (week.id === 1 || week.id === 6) {
    let myChoice = 'Cooperate';
    let partnerChoice = 'Cooperate';

    if (week.id === 1) {
      // One-shot strangers: 55% Defect, 45% Cooperate
      myChoice = Math.random() < 0.45 ? 'Cooperate' : 'Defect';
      partnerChoice = Math.random() < 0.5 ? 'Cooperate' : 'Defect';
    } else {
      // Week 6: Repeated interaction with reactive trajectory
      if (roundNum === 1) {
        myChoice = Math.random() < 0.75 ? 'Cooperate' : 'Defect';
        partnerChoice = 'Cooperate'; // Friendly initial move
      } else {
        const lastRound = history[history.length - 1];
        const lastMyChoice = lastRound?.myChoice || 'Cooperate';
        const hadDefection = history.some(h => h.myChoice === 'Defect');

        if (!hadDefection && lastMyChoice === 'Cooperate') {
          // Sustained mutual cooperation
          myChoice = Math.random() < 0.8 ? 'Cooperate' : 'Defect';
          partnerChoice = 'Cooperate';
        } else {
          // Retaliation triggered
          partnerChoice = lastMyChoice === 'Defect' ? 'Defect' : (Math.random() < 0.6 ? 'Cooperate' : 'Defect');
          myChoice = Math.random() < 0.5 ? 'Defect' : 'Cooperate';
        }
      }
    }

    return {
      ...baseData,
      myChoice,
      partnerChoice
    };
  }

  // Week 2: Launch-or-Wait
  if (week.id === 2) {
    const isFirstMover = Math.random() < 0.5;
    const fm = Math.random() < 0.6 ? 'Launch' : 'Wait';
    const sm = fm === 'Launch' ? (Math.random() < 0.7 ? 'Stay Out' : 'Enter') : 'Enter';
    return {
      ...baseData,
      myRole: isFirstMover ? 'First Mover' : 'Second Mover',
      fmChoice: fm,
      smChoice: sm
    };
  }

  // Week 3: Simultaneous Pricing
  if (week.id === 3) {
    return {
      ...baseData,
      myPrice: Math.random() < 0.5 ? 'High Price' : 'Low Price',
      partnerPrice: Math.random() < 0.5 ? 'High Price' : 'Low Price'
    };
  }

  // Week 4: Random Promotion-Day
  if (week.id === 4) {
    const days = ['Monday', 'Wednesday', 'Friday'];
    return {
      ...baseData,
      myDay: days[Math.floor(Math.random() * days.length)],
      partnerDay: days[Math.floor(Math.random() * days.length)]
    };
  }

  // Game 11: Keynesian Beauty Contest (Guess 2/3 of Average)
  if (week.id === 11) {
    // Strategic depth: Level-0 (~50), Level-1 (~33), Level-2 (~22), Nash (~0)
    const levels = [33, 22, 28, 35, 45, 18, 24];
    const myGuess = levels[Math.floor(Math.random() * levels.length)] + (Math.floor(Math.random() * 5) - 2);
    const cohortAverage = Math.round((30 + Math.random() * 12) * 10) / 10;
    const targetValue = Math.round((cohortAverage * 2 / 3) * 10) / 10;
    const diff = Math.abs(myGuess - targetValue);
    const isWinner = diff < 4;

    return {
      ...baseData,
      myGuess,
      classAverage: cohortAverage,
      targetValue,
      isWinner: isWinner ? 'true' : 'false'
    };
  }

  // Game 12: Public Goods Game (Free-Rider Dilemma)
  if (week.id === 12) {
    // Dynamic contribution decaying or stabilizing across rounds
    const decayFactor = Math.max(0.2, 1 - (roundNum - 1) * 0.12);
    const myContribution = Math.max(0, Math.min(10, Math.round((Math.random() * 5 + 3) * decayFactor)));
    const peer1 = Math.max(0, Math.min(10, Math.round((Math.random() * 6 + 2) * decayFactor)));
    const peer2 = Math.max(0, Math.min(10, Math.round((Math.random() * 5 + 1) * decayFactor)));
    const peer3 = Math.max(0, Math.min(10, Math.round((Math.random() * 7 + 2) * decayFactor)));
    const groupContributions = myContribution + peer1 + peer2 + peer3;
    const groupReturn = Math.round((groupContributions * 1.6 / 4) * 10) / 10;

    return {
      ...baseData,
      myContribution,
      groupContributions,
      groupReturn
    };
  }

  // Game 9: Split-the-Pie Bargaining
  if (week.id === 9) {
    const myDem = Math.floor(Math.random() * 4) + 4; // 4 to 7
    const partnerDem = 10 - myDem + (Math.random() < 0.25 ? 1 : 0); // 75% deal, 25% breakdown
    return {
      ...baseData,
      myDemand: myDem,
      partnerDemand: partnerDem
    };
  }

  // Game 10: Costly Signaling
  if (week.id === 10) {
    const isHigh = Math.random() < 0.6;
    const signal = isHigh ? (Math.random() < 0.85 ? 'Yes (Costly)' : 'No') : (Math.random() < 0.2 ? 'Yes (Costly)' : 'No');
    const trust = signal === 'Yes (Costly)' ? 'Yes' : (Math.random() < 0.3 ? 'Yes' : 'No');
    return {
      ...baseData,
      myRole: isHigh ? 'Seller (High Quality)' : 'Seller (Low Quality)',
      signal,
      trust
    };
  }

  // Fallback for any other game with fields
  const dynamicData: RoundData = { ...baseData };
  week.fields.forEach(f => {
    if (f.options && f.options.length > 0) {
      dynamicData[f.id] = f.options[Math.floor(Math.random() * f.options.length)];
    } else if (f.type === 'number') {
      dynamicData[f.id] = Math.floor(Math.random() * 10) + 1;
    } else {
      dynamicData[f.id] = 'Option A';
    }
  });

  return dynamicData;
}

/**
 * Generates a full fresh trial containing randomized data for all rounds (1..totalRounds)
 */
export function generateFullFreshTrial(
  week: WeekConfig,
  totalRounds: number,
  studentAlias: string
): { [roundNum: number]: RoundData } {
  const result: { [roundNum: number]: RoundData } = {};
  const history: { round: number; myChoice?: string; partnerChoice?: string }[] = [];

  for (let r = 1; r <= totalRounds; r++) {
    const rData = generateRandomRoundData(week, r, totalRounds, studentAlias, history);
    result[r] = rData;
    history.push({
      round: r,
      myChoice: rData.myChoice as string,
      partnerChoice: rData.partnerChoice as string
    });
  }

  return result;
}
