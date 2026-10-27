// Auction Game Engine for DOTE 3090 / MobLab Experiments
// Simulates private value draws and sealed-bid auction market dynamics

export type AuctionType = 'second_price' | 'first_price';

export interface CompetitorBid {
  alias: string;
  valuation: number;
  bid: number;
  isStudent?: boolean;
}

export interface AuctionResult {
  round: number;
  auctionType: AuctionType;
  studentValuation: number;
  studentBid: number;
  competitors: CompetitorBid[];
  allBids: CompetitorBid[];
  highestBid: number;
  secondHighestBid: number;
  clearingPrice: number;
  winnerAlias: string;
  isStudentWinner: boolean;
  profit: number;
}

const COMPETITOR_NAMES = [
  'SwiftFalcon_29',
  'AlphaWolf_18',
  'QuietOwl_54',
  'BrightLynx_33',
  'QuantumFox_77',
  'SilverHawk_12',
  'WiseTiger_61',
  'PatientBadger_85'
];

/**
 * Deterministically draws a private valuation for a student in a specific round.
 * Uses a pseudo-random hash so the value stays identical across browser refreshes.
 */
/**
 * Deterministically draws a private valuation for a student in a specific round.
 * Uses a pseudo-random hash so the value stays identical across browser refreshes.
 * Uniform distribution from 1 to 10 (each value 1..10 has equal 10% probability).
 */
export function drawValuation(
  studentSeed: string,
  roundNum: number,
  minVal = 1,
  maxVal = 10
): number {
  const seedStr = `${studentSeed || 'student'}_vickrey_rd_${roundNum}`;
  let hash = 0;
  for (let i = 0; i < seedStr.length; i++) {
    hash = (hash * 37 + seedStr.charCodeAt(i) * (i + 13)) % 1000003;
  }
  const range = maxVal - minVal;
  const drawn = minVal + (Math.abs(hash) % (range + 1));
  return Math.round(drawn);
}

/**
 * Simulates competing bidders in the student's auction market (typically 3 competitors, making a 4-person auction).
 * Each competitor draws a valuation uniformly from [minVal, maxVal] (default 1 to 10).
 * Bids can be any number.
 */
export function generateCompetitors(
  roundNum: number,
  studentSeed: string,
  auctionType: AuctionType = 'second_price',
  numCompetitors = 3,
  minVal = 1,
  maxVal = 10
): CompetitorBid[] {
  const competitors: CompetitorBid[] = [];
  const seedHash = (studentSeed || 'default').split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);

  for (let i = 0; i < numCompetitors; i++) {
    const compName = COMPETITOR_NAMES[(seedHash + roundNum * 3 + i) % COMPETITOR_NAMES.length];
    
    // Draw competitor's private valuation uniformly from [minVal, maxVal]
    const compSeed = `${compName}_rd_${roundNum}_idx_${i}`;
    let compHash = 0;
    for (let j = 0; j < compSeed.length; j++) {
      compHash = (compHash * 41 + compSeed.charCodeAt(j) * (j + 7)) % 999983;
    }
    const valuation = minVal + (Math.abs(compHash) % (maxVal - minVal + 1));

    // Behavior simulation:
    // In Second-Price: some bid near valuation (~truthful), some underbid, some overbid.
    // In First-Price: competitors shade their bids (typically bid (N-1)/N * valuation).
    let bid = valuation;
    const behaviorSeed = Math.abs(compHash) % 100;

    if (auctionType === 'second_price') {
      if (behaviorSeed < 60) {
        // Truthful bidding (Weakly Dominant Strategy) or slight jitter
        if (behaviorSeed < 40) {
          bid = valuation;
        } else {
          // slight 0.5 jitter
          const delta = behaviorSeed % 2 === 0 ? 0.5 : -0.5;
          bid = Math.max(0.5, valuation + delta);
        }
      } else if (behaviorSeed < 85) {
        // Shaded / cautious bidder (underbidding)
        bid = Math.max(0.5, Math.round(valuation * 0.75 * 2) / 2);
      } else {
        // Aggressive / overbidder (Winner's curse trap)
        bid = Math.round((valuation + 1 + (behaviorSeed % 3) * 0.5) * 2) / 2;
      }
    } else {
      // First-price auction: Nash bidding for N=4 bidders is (N-1)/N * v = 0.75 * v
      const shade = 0.7 + ((behaviorSeed % 15) / 100);
      bid = Math.max(0.5, Math.round(valuation * shade * 2) / 2);
    }

    competitors.push({
      alias: compName,
      valuation,
      bid: Number(bid.toFixed(1))
    });
  }

  return competitors;
}

/**
 * Resolves the sealed-bid auction given the student's valuation and submitted bid.
 * Bids can be any number.
 */
export function resolveAuction(
  studentValuation: number,
  studentBid: number,
  roundNum: number,
  studentAlias: string,
  auctionType: AuctionType = 'second_price',
  numCompetitors = 3,
  minVal = 1,
  maxVal = 10
): AuctionResult {
  const competitors = generateCompetitors(roundNum, studentAlias, auctionType, numCompetitors, minVal, maxVal);

  const studentEntry: CompetitorBid = {
    alias: studentAlias || 'You',
    valuation: studentValuation,
    bid: Number(studentBid.toFixed(2)),
    isStudent: true
  };

  const allBids = [studentEntry, ...competitors];
  // Sort descending by bid amount; in case of tie, student prioritized or first
  allBids.sort((a, b) => b.bid - a.bid);

  const highestBid = allBids[0].bid;
  const secondHighestBid = allBids.length > 1 ? allBids[1].bid : highestBid;

  const isStudentWinner = allBids[0].isStudent === true;
  const winnerAlias = allBids[0].alias;

  const clearingPrice = auctionType === 'second_price' ? secondHighestBid : highestBid;

  // In second-price: profit = valuation - secondHighestBid
  // In first-price: profit = valuation - highestBid (own bid)
  let profit = 0;
  if (isStudentWinner) {
    profit = Math.round((studentValuation - clearingPrice) * 100) / 100;
  }

  return {
    round: roundNum,
    auctionType,
    studentValuation,
    studentBid: Number(studentBid.toFixed(2)),
    competitors,
    allBids,
    highestBid: Number(highestBid.toFixed(2)),
    secondHighestBid: Number(secondHighestBid.toFixed(2)),
    clearingPrice: Number(clearingPrice.toFixed(2)),
    winnerAlias,
    isStudentWinner,
    profit
  };
}
