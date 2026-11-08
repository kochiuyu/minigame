export type GameId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 12 | 13 | 15 | 17 | 18 | 19 | 20 | 23 | 27 | 29 | 30;
export type Choice = 'Cooperate' | 'Defect' | 'High Price' | 'Low Price' | 'Launch' | 'Wait' | 'Commit' | 'Stay Flexible' | 'Enter' | 'Stay Out' | 'Monday' | 'Wednesday' | 'Friday' | 'Hunt Stag' | 'Hunt Hare' | 'Dove' | 'Hawk' | 'Heads' | 'Tails' | 'Opera' | 'Football' | 'Rock' | 'Paper' | 'Scissors' | 'Accept' | 'Reject' | 'Take at Node 1' | 'Take at Node 2' | 'Take at Node 3' | 'Take at Node 4' | 'Take at Node 5' | 'Take at Node 6' | 'Pass All' | `Bid ${number}` | `Offer ${number}` | `Contribute ${number}` | `Invest ${number}` | `Return ${number}` | `Trawlers ${number}` | `Deploy ${number}/${number}/${number}`;
export type Role = 'first' | 'second';
export type RoomConfig = {
  round: number;
  phase: 'lobby' | 'playing' | 'revealed' | 'finished';
  gameId: GameId;
  step?: 'offer' | 'respond'; // Also used for Trust Game: invest, then return.
  centipedeNode?: number; // Current live decision, 1–6; 7 means all chains ended.
  repeatedTurn?: number; // Current Prisoner's Dilemma turn, 1–5; 6 means complete.
  totalRounds?: number; // Absent in classes started before round limits were added.
  summaries?: Record<string, RoundSummary>; // Only rounds released to students.
};
export type Participant = { alias: string };
export type Assignment = {
  round: number;
  kind: 'student' | 'bot' | 'group';
  opponentAlias: string;
  opponentUid?: string;
  role?: Role;
  groupId?: string;
  groupSize?: number;
  valuation?: number; // Private auction value, drawn independently for each bidder.
};
export type Submission = { round: number; choice: Choice };
export type VisibleOffer = { round: number; choice: Choice; fromBot: boolean };
export type CentipedeDecision = { round: number; choice: 'Take' | 'Pass' };
export type CentipedePath = { round: number; moves: Record<string, 'Take' | 'Pass'>; exitNode?: number; fallback?: boolean };
export type PracticeCentipedePath = { node: number; moves: Record<string, 'Take' | 'Pass'>; exitNode?: number };
export type RepeatedTurn = { own: 'Cooperate' | 'Defect'; other: 'Cooperate' | 'Defect'; ownPoints: number; otherPoints: number; bot: boolean };
export type RepeatedPath = { round: number; turns: Record<string, RepeatedTurn> };
export type MatchResult = {
  round: number;
  ownChoice: Choice;
  opponentChoice?: Choice;
  ownPoints: number;
  opponentPoints?: number;
  opponentAlias: string;
  opponentKind: 'student' | 'bot' | 'group';
  fallback: boolean;
  auction?: { valuation: number; winningBid: number; price: number; won: boolean };
  exitNode?: number; // Centipede: 1–6 for a Take, 7 when both pass all nodes.
  centipedeMoves?: Record<string, 'Take' | 'Pass'>;
  repeatedTurns?: Record<string, RepeatedTurn>;
  group?: { totalContribution: number; classmates: number; bots: number; missing: number };
};
export type RoundSummary = {
  round: number;
  gameId: GameId;
  submitted: number;
  choiceCounts: Array<{ label: Choice; count: number }>;
  studentPairs: number;
  studentGroups?: number;
  outcomes: Array<{ label: string; count: number }>;
  botMatches: number;
  botSeats?: number;
  fallbacks: number;
  averageContribution?: number | null;
  averagePool?: number | null;
  averageReturn?: number | null;
  scoredStudents: number;
  totalPoints: number;
  averagePoints: number | null;
};
export type RoundArchive = {
  summary: RoundSummary;
  results: Record<string, MatchResult>;
  aliases: Record<string, string>;
};
export type LiveRoom = {
  config?: RoomConfig;
  participants?: Record<string, Participant>;
  assignments?: Record<string, Assignment> | null;
  choices?: Record<string, Submission> | null;
  offers?: Record<string, VisibleOffer> | null;
  results?: Record<string, MatchResult | Record<string, MatchResult>>;
  archive?: Record<string, RoundArchive>;
  centipedeDecisions?: Record<string, Record<string, CentipedeDecision>> | null;
  centipedePaths?: Record<string, CentipedePath> | null;
  repeatedDecisions?: Record<string, Record<string, Submission>> | null;
  repeatedPaths?: Record<string, RepeatedPath> | null;
};

export const BOT_ALIAS = 'Random bot';
export const ALIAS_ICONS = ['🦊', '🐼', '🐙', '🐢', '🦉', '🐬', '🦋', '🐝', '🦖', '🐧'] as const;
const ALIAS_WORDS = ['Breeze', 'Comet', 'Echo', 'Nova', 'Orbit', 'Pixel', 'Puzzle', 'Ripple', 'Rocket', 'Spark', 'Star', 'Wave', 'Clover', 'Mochi', 'Pebble', 'Sunny', 'Tiger', 'Willow'];

function randomIndex(length: number): number {
  return Math.floor(Math.random() * length);
}

export function randomStudentAlias(): string {
  const icon = ALIAS_ICONS[randomIndex(ALIAS_ICONS.length)];
  return `${icon} ${ALIAS_WORDS[randomIndex(ALIAS_WORDS.length)]}${100 + randomIndex(900)}`;
}

export function shuffleAliasIcon(alias: string): string {
  if (!alias.trim()) return randomStudentAlias();
  const current = ALIAS_ICONS.find(icon => alias.startsWith(`${icon} `));
  const options = ALIAS_ICONS.filter(icon => icon !== current);
  const icon = options[randomIndex(options.length)];
  const name = current ? alias.slice(current.length).trim() : alias.trim();
  const limit = 30 - icon.length - 1;
  let fitted = '';
  for (const character of name) {
    if ((fitted + character).length > limit) break;
    fitted += character;
  }
  return `${icon} ${fitted.trim()}`;
}

export const ULTIMATUM_OFFERS = Array.from({ length: 21 }, (_, index) => `Offer ${index / 2}` as Choice) as [Choice, Choice, ...Choice[]];
export const AUCTION_BIDS = Array.from({ length: 13 }, (_, index) => `Bid ${index}` as Choice) as [Choice, Choice, ...Choice[]];
export const randomAuctionValue = (): number => 1 + randomIndex(10);
export function auctionBid(choice: Choice): number | null {
  return /^Bid (?:1[0-2]|[0-9])$/.test(choice) ? Number(choice.slice(4)) : null;
}
export function auctionPayoff(ownBid: number, otherBid: number, valuation: number, winTie = false): { points: number; won: boolean; price: number } {
  if (![ownBid, otherBid, valuation].every(Number.isInteger) || ownBid < 0 || ownBid > 12 || otherBid < 0 || otherBid > 12 || valuation < 1 || valuation > 10) throw new Error('Invalid auction bid or valuation.');
  const won = ownBid > otherBid || (ownBid === otherBid && winTie);
  return { points: won ? valuation - otherBid : 0, won, price: won ? otherBid : 0 };
}
export const PUBLIC_GOODS_CONTRIBUTIONS = Array.from({ length: 11 }, (_, index) => `Contribute ${index}` as Choice) as [Choice, Choice, ...Choice[]];
export const FISHERY_TRAWLERS = Array.from({ length: 11 }, (_, index) => `Trawlers ${index}` as Choice) as [Choice, Choice, ...Choice[]];
export const TRUST_INVESTMENTS = Array.from({ length: 11 }, (_, index) => `Invest ${index}` as Choice) as [Choice, Choice, ...Choice[]];
export const BLOTTO_DEPLOYMENTS = ['Deploy 34/33/33', 'Deploy 50/50/0', 'Deploy 50/0/50', 'Deploy 0/50/50', 'Deploy 60/0/40', 'Deploy 0/60/40'] as const;
export const CENTIPEDE_FIRST = ['Take at Node 1', 'Take at Node 3', 'Take at Node 5', 'Pass All'] as const;
export const CENTIPEDE_SECOND = ['Take at Node 2', 'Take at Node 4', 'Take at Node 6', 'Pass All'] as const;
export const PUBLIC_GOODS_GROUP_SIZE = 4;

export const LIVE_GAMES: ReadonlyArray<{
  id: GameId;
  title: string;
  options: readonly [Choice, Choice, ...Choice[]];
  payoffs: string;
  rules: string;
  roles?: readonly [string, string];
}> = [
  { id: 1, title: "Prisoner's Dilemma", options: ['Cooperate', 'Defect'], rules: 'You and the bot each choose Cooperate or Defect without seeing the other choice.', payoffs: 'Both Cooperate: 2 each · Both Defect: 1 each · Defect against Cooperate: 3–0' },
  { id: 3, title: 'Highway Gas War', options: ['High Price', 'Low Price'], rules: 'Two stations across a highway secretly post a High ($4) or Low ($3) price. Motorists choose the cheaper station.', payoffs: 'Both High: 2 each · Both Low: 1 each · Low against High: 3 / 0 (Low / High)' },
  { id: 7, title: 'Second-Price Auction', options: AUCTION_BIDS, rules: 'You receive a private value from 1–10 for the artwork. Submit a sealed whole-point bid from 0–12. The highest bid wins but pays the other bid.', payoffs: 'Winner score = own value − other bid. Loser scores 0. If bids tie, the first paired bidder wins.' },
  { id: 2, title: 'Sequential Entry', options: ['Launch', 'Wait', 'Enter', 'Stay Out'], rules: 'The First Mover chooses Launch or Wait. The Second Mover sees that decision, then chooses Enter or Stay Out.', payoffs: 'Launch + Stay Out: 4 / 1 · Launch + Enter: 2 / 2 · Wait + Enter: 1 / 4 · Wait + Stay Out: 0 / 0 (First / Second Mover)', roles: ['First Mover', 'Second Mover'] },
  { id: 5, title: 'Entry Deterrence', options: ['Commit', 'Stay Flexible', 'Enter', 'Stay Out'], rules: 'The Incumbent chooses whether to make an irreversible commitment. The Rival sees that choice, then decides whether to enter the market.', payoffs: 'Commit + Stay Out: 4 / 0 · Commit + Enter: −2 / −2 · Stay Flexible + Enter: 2 / 2 · Stay Flexible + Stay Out: 4 / 0 (Incumbent / Rival)', roles: ['Incumbent', 'Rival'] },
  { id: 6, title: "Repeated Prisoner's Dilemma", options: ['Cooperate', 'Defect'], rules: 'Play five turns with the same partner. Each turn, both choose Cooperate or Defect without seeing the other choice. After both decisions, you see what happened before choosing again.', payoffs: 'Each turn: Both Cooperate 2 each · Both Defect 1 each · Defect against Cooperate 3 / 0' },
  { id: 4, title: 'Promotion Timing', options: ['Monday', 'Wednesday', 'Friday'], rules: 'You and your rival secretly choose a day to launch a promotion. A clash on the same day splits attention.', payoffs: 'Same day: 0 each · Different days: 1 each' },
  { id: 12, title: 'Public Goods Game', options: PUBLIC_GOODS_CONTRIBUTIONS, rules: 'Each of four players starts with 10 points and secretly contributes 0–10 to a shared pool. Random bots fill empty seats.', payoffs: 'The pool is multiplied by 1.6 and split equally. Your score = 10 − your contribution + 0.4 × total pool.' },
  { id: 13, title: 'Stag Hunt', options: ['Hunt Stag', 'Hunt Hare'], rules: 'You and the bot each choose a hunt. Stag pays most when you both choose it; Hare is the safer choice.', payoffs: 'Both Stag: 10 each · Both Hare: 4 each · Stag against Hare: 0–4' },
  { id: 15, title: 'Hawk–Dove', options: ['Dove', 'Hawk'], rules: 'You and the bot each choose Dove or Hawk. Hawk gains against Dove, but two Hawks both lose points.', payoffs: 'Both Dove: 3 each · Both Hawk: −10 each · Hawk against Dove: 6–0' },
  { id: 17, title: 'Matching Pennies', options: ['Heads', 'Tails'], rules: 'Both choose Heads or Tails. The Matcher scores when the choices match; the Mismatcher scores when they differ.', payoffs: 'Same choices: Matcher 2, Mismatcher 0 · Different choices: Matcher 0, Mismatcher 2', roles: ['Matcher', 'Mismatcher'] },
  { id: 18, title: 'Battle of the Sexes', options: ['Opera', 'Football'], rules: 'Both choose Opera or Football. You score only if your choices match; each role prefers a different match.', payoffs: 'Both Opera: Opera fan 3, Football fan 2 · Both Football: Opera fan 2, Football fan 3 · Different choices: 0 each', roles: ['Opera fan', 'Football fan'] },
  { id: 19, title: 'Trust Game', options: TRUST_INVESTMENTS, rules: 'The Investor starts with 10 points and sends 0–10 to the Trustee. The amount sent triples. The Trustee then chooses how much of the tripled amount to return.', payoffs: 'Investor score = 10 − amount invested + amount returned. Trustee score = 3 × amount invested − amount returned.', roles: ['Investor', 'Trustee'] },
  { id: 20, title: 'Centipede Game', options: ['Take at Node 1', 'Take at Node 2', 'Take at Node 3', 'Take at Node 4', 'Take at Node 5', 'Take at Node 6', 'Pass All'], rules: 'Player 1 moves at nodes 1, 3, and 5; Player 2 moves at nodes 2, 4, and 6. At each turn, Take ends the game and Pass gives the next turn to the other player. If both pass all six nodes, both earn 8.', payoffs: 'Take at node 1: 2 / 0 · 2: 1 / 4 · 3: 4 / 2 · 4: 3 / 6 · 5: 6 / 4 · 6: 5 / 8 · Both Pass All: 8 / 8 (Player 1 / Player 2)', roles: ['Player 1', 'Player 2'] },
  { id: 23, title: 'Colonel Blotto', options: BLOTTO_DEPLOYMENTS, rules: 'Choose how to deploy 100 troops across Fronts A, B, and C. Each number in a deployment plan is the troop count for one front. Your opponent chooses secretly.', payoffs: 'More troops wins a front. Win more fronts than your opponent: +1 point; lose more: −1 point; equal front wins: 0 points.' },
  { id: 27, title: 'Renewable Fishery', options: FISHERY_TRAWLERS, rules: 'You and one partner secretly deploy 0–10 trawlers each. More boats can earn more, but heavy combined effort depletes the shared fishery. Each class round is an independent catch.', payoffs: 'Total boats 0–8: 2 points profit per boat · 9–12: 0.9 per boat · 13–20: −0.5 per boat. Both fleets face the same stock condition.' },
  { id: 29, title: 'Rock–Paper–Scissors', options: ['Rock', 'Paper', 'Scissors'], rules: 'You and the bot each choose one move without seeing the other choice. Each move beats one other move.', payoffs: 'Rock beats Scissors · Paper beats Rock · Scissors beats Paper · Winner: 2 points, loser: 0 · Tie: 1 point each' },
  { id: 30, title: 'Ultimatum Game', options: [...ULTIMATUM_OFFERS, 'Accept', 'Reject'], rules: 'The Proposer offers part of a 10-point pot. The Responder sees the offer and accepts or rejects it.', payoffs: 'Proposer offers 0–10 points from a pot of 10, in half-point steps. Responder accepts (split as offered) or rejects (both get 0).', roles: ['Proposer', 'Responder'] },
];

export function gameFor(id?: GameId): (typeof LIVE_GAMES)[number] {
  return LIVE_GAMES.find(game => game.id === id) || LIVE_GAMES[0];
}

export function randomChoice(gameId: GameId = 1): Choice {
  const options = gameId === 30 ? ULTIMATUM_OFFERS : gameId === 2 ? (['Launch', 'Wait'] as const) : gameId === 5 ? (['Commit', 'Stay Flexible'] as const) : gameId === 20 ? CENTIPEDE_FIRST : gameFor(gameId).options;
  return options[randomIndex(options.length)];
}

export function blottoAllocation(choice: Choice): [number, number, number] | null {
  if (!BLOTTO_DEPLOYMENTS.includes(choice as typeof BLOTTO_DEPLOYMENTS[number])) return null;
  const match = /^Deploy (\d+)\/(\d+)\/(\d+)$/.exec(choice);
  if (!match) return null;
  const allocation = [Number(match[1]), Number(match[2]), Number(match[3])] as [number, number, number];
  return allocation.reduce((sum, value) => sum + value, 0) === 100 ? allocation : null;
}

export function investAmount(choice: Choice): number | null {
  return /^Invest (?:10|[0-9])$/.test(choice) ? Number(choice.slice(7)) : null;
}

export function returnAmount(choice: Choice): number | null {
  return /^Return (?:30|[12][0-9]|[0-9])$/.test(choice) ? Number(choice.slice(7)) : null;
}

export function trustPoints(investment: number, returned: number): [number, number] {
  return [10 - investment + returned, 3 * investment - returned];
}

export function randomReturn(investment: number): Choice {
  return `Return ${randomIndex(3 * investment + 1)}`;
}

export function contributionAmount(choice: Choice): number | null {
  if (!/^Contribute (?:10|[0-9])$/.test(choice)) return null;
  return Number(choice.slice(11));
}

export function trawlerAmount(choice: Choice): number | null {
  return /^Trawlers (?:10|[0-9])$/.test(choice) ? Number(choice.slice(9)) : null;
}

export function fisheryPoints(ownBoats: number, otherBoats: number): [number, number] {
  if (![ownBoats, otherBoats].every(value => Number.isInteger(value) && value >= 0 && value <= 10)) throw new Error('Invalid fishery fleet.');
  const total = ownBoats + otherBoats;
  const profitPerBoat = total > 12 ? -0.5 : total > 8 ? 0.9 : 2;
  return [Math.round(ownBoats * profitPerBoat * 10) / 10, Math.round(otherBoats * profitPerBoat * 10) / 10];
}

export function publicGoodsPoints(contribution: number, totalPool: number): number {
  return Math.round((10 - contribution + totalPool * 0.4) * 10) / 10;
}

export function offerAmount(choice: Choice): number | null {
  if (!/^Offer (?:10|[0-9])(?:\.5)?$/.test(choice)) return null;
  const amount = Number(choice.slice(6));
  return amount <= 10 ? amount : null;
}

export function ultimatumPoints(offer: Choice, response: Choice): [number, number] {
  const amount = offerAmount(offer);
  if (amount === null || (response !== 'Accept' && response !== 'Reject')) return [0, 0];
  return response === 'Accept' ? [10 - amount, amount] : [0, 0];
}

export function pointsFor(gameId: GameId, own: Choice, other: Choice, role: Role = 'first'): [number, number] {
  switch (gameId) {
    case 7:
      throw new Error('Auction scoring requires private valuations.');
    case 3:
      if (!['High Price', 'Low Price'].includes(own) || !['High Price', 'Low Price'].includes(other)) throw new Error('Invalid Highway Gas War choices.');
      if (own === 'High Price' && other === 'High Price') return [2, 2];
      if (own === 'Low Price' && other === 'Low Price') return [1, 1];
      return own === 'Low Price' ? [3, 0] : [0, 3];
    case 20: {
      const first = role === 'first' ? own : other;
      const second = role === 'first' ? other : own;
      const node = centipedeExitNode(first, second);
      const payoff: [number, number] = node === 1 ? [2, 0] : node === 2 ? [1, 4] : node === 3 ? [4, 2]
        : node === 4 ? [3, 6] : node === 5 ? [6, 4] : node === 6 ? [5, 8] : [8, 8];
      return role === 'first' ? payoff : [payoff[1], payoff[0]];
    }
    case 2: {
      const first = role === 'first' ? own : other;
      const second = role === 'first' ? other : own;
      if ((first !== 'Launch' && first !== 'Wait') || (second !== 'Enter' && second !== 'Stay Out')) throw new Error('Invalid Sequential Entry choices.');
      const points: [number, number] = first === 'Launch' ? second === 'Enter' ? [2, 2] : [4, 1]
        : second === 'Enter' ? [1, 4] : [0, 0];
      return role === 'first' ? points : [points[1], points[0]];
    }
    case 5: {
      const incumbent = role === 'first' ? own : other;
      const rival = role === 'first' ? other : own;
      if ((incumbent !== 'Commit' && incumbent !== 'Stay Flexible') || (rival !== 'Enter' && rival !== 'Stay Out')) throw new Error('Invalid Entry Deterrence choices.');
      const points: [number, number] = rival === 'Stay Out' ? [4, 0] : incumbent === 'Commit' ? [-2, -2] : [2, 2];
      return role === 'first' ? points : [points[1], points[0]];
    }
    case 12:
      throw new Error('Public Goods requires a four-player group pool.');
    case 27: {
      const ownBoats = trawlerAmount(own);
      const otherBoats = trawlerAmount(other);
      if (ownBoats === null || otherBoats === null) throw new Error('Invalid fishery choices.');
      return fisheryPoints(ownBoats, otherBoats);
    }
    case 19: {
      const investment = investAmount(role === 'first' ? own : other);
      const returned = returnAmount(role === 'first' ? other : own);
      if (investment === null || returned === null || returned > 3 * investment) throw new Error('Invalid Trust Game choices.');
      const [investor, trustee] = trustPoints(investment, returned);
      return role === 'first' ? [investor, trustee] : [trustee, investor];
    }
    case 30: {
      const [proposer, responder] = role === 'first' ? ultimatumPoints(own, other) : ultimatumPoints(other, own);
      return role === 'first' ? [proposer, responder] : [responder, proposer];
    }
    case 4:
      return own === other ? [0, 0] : [1, 1];
    case 23: {
      const ownAllocation = blottoAllocation(own);
      const otherAllocation = blottoAllocation(other);
      if (!ownAllocation || !otherAllocation) throw new Error('Invalid Colonel Blotto deployment.');
      const wins = ownAllocation.reduce((total, troops, front) => total + Math.sign(troops - otherAllocation[front]), 0);
      const score = Math.sign(wins);
      return [score, score === 0 ? 0 : -score];
    }
    case 13:
      if (own === 'Hunt Stag' && other === 'Hunt Stag') return [10, 10];
      if (own === 'Hunt Hare' && other === 'Hunt Hare') return [4, 4];
      return own === 'Hunt Stag' ? [0, 4] : [4, 0];
    case 15:
      if (own === 'Dove' && other === 'Dove') return [3, 3];
      if (own === 'Hawk' && other === 'Hawk') return [-10, -10];
      return own === 'Hawk' ? [6, 0] : [0, 6];
    case 17: {
      const matcherWins = own === other;
      const ownWins = role === 'first' ? matcherWins : !matcherWins;
      return ownWins ? [2, 0] : [0, 2];
    }
    case 18:
      if (own !== other) return [0, 0];
      if (own === 'Opera') return role === 'first' ? [3, 2] : [2, 3];
      return role === 'first' ? [2, 3] : [3, 2];
    case 29:
      if (own === other) return [1, 1];
      return (own === 'Rock' && other === 'Scissors')
        || (own === 'Paper' && other === 'Rock')
        || (own === 'Scissors' && other === 'Paper') ? [2, 0] : [0, 2];
    case 1:
    case 6:
      if (own === 'Cooperate' && other === 'Cooperate') return [2, 2];
      if (own === 'Defect' && other === 'Defect') return [1, 1];
      return own === 'Defect' ? [3, 0] : [0, 3];
  }
}

export function centipedeExitNode(first: Choice, second: Choice): number {
  if (!CENTIPEDE_FIRST.includes(first as typeof CENTIPEDE_FIRST[number]) || !CENTIPEDE_SECOND.includes(second as typeof CENTIPEDE_SECOND[number])) throw new Error('Invalid Centipede plans.');
  const firstTake = first === 'Pass All' ? 7 : Number(first.slice(-1));
  const secondTake = second === 'Pass All' ? 7 : Number(second.slice(-1));
  return Math.min(firstTake, secondTake);
}

// Complete one student move, then resolve bot turns until the student moves again or the chain ends.
export function advancePracticeCentipede(
  path: PracticeCentipedePath,
  studentRole: Role,
  studentMove?: 'Take' | 'Pass',
  botMove: () => 'Take' | 'Pass' = () => Math.random() < 0.5 ? 'Take' : 'Pass',
): PracticeCentipedePath {
  if (path.exitNode || path.node < 1 || path.node > 6) return path;
  let node = path.node;
  const moves = { ...path.moves };
  let studentUsed = false;
  while (node <= 6) {
    const actorRole = node % 2 ? 'first' : 'second';
    const isStudent = actorRole === studentRole;
    if (isStudent && studentUsed) break;
    if (isStudent && !studentMove) break;
    const move = isStudent ? studentMove! : botMove();
    if (move !== 'Take' && move !== 'Pass') throw new Error('Invalid Centipede move.');
    moves[node] = move;
    if (isStudent) studentUsed = true;
    if (move === 'Take') return { node: node + 1, moves, exitNode: node };
    node++;
  }
  return { node, moves, ...(node === 7 ? { exitNode: 7 } : {}) };
}

export function practiceCentipedePoints(exitNode: number, studentRole: Role): [number, number] {
  const points = [[2, 0], [1, 4], [4, 2], [3, 6], [6, 4], [5, 8], [8, 8]][exitNode - 1];
  if (!points) throw new Error('Invalid Centipede exit node.');
  return studentRole === 'first' ? [points[0], points[1]] : [points[1], points[0]];
}

export function pairParticipants(participants: Record<string, Participant>, round: number, gameId: GameId = 1): Record<string, Assignment> {
  const uids = Object.keys(participants);
  for (let i = uids.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [uids[i], uids[j]] = [uids[j], uids[i]];
  }
  const assignments: Record<string, Assignment> = {};
  for (let i = 0; i < uids.length; i += 2) {
    const first = uids[i];
    const second = uids[i + 1];
    if (!second) {
      assignments[first] = { round, kind: 'bot', opponentAlias: BOT_ALIAS, role: 'first', ...(gameId === 7 ? { valuation: randomAuctionValue() } : {}) };
    } else {
      assignments[first] = { round, kind: 'student', opponentUid: second, opponentAlias: participants[second].alias, role: 'first', ...(gameId === 7 ? { valuation: randomAuctionValue() } : {}) };
      assignments[second] = { round, kind: 'student', opponentUid: first, opponentAlias: participants[first].alias, role: 'second', ...(gameId === 7 ? { valuation: randomAuctionValue() } : {}) };
    }
  }
  return assignments;
}

export function groupParticipants(participants: Record<string, Participant>, round: number): Record<string, Assignment> {
  const uids = Object.keys(participants);
  for (let i = uids.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [uids[i], uids[j]] = [uids[j], uids[i]];
  }
  const assignments: Record<string, Assignment> = {};
  for (let i = 0; i < uids.length; i += PUBLIC_GOODS_GROUP_SIZE) {
    const members = uids.slice(i, i + PUBLIC_GOODS_GROUP_SIZE);
    for (const uid of members) {
      assignments[uid] = { round, kind: 'group', groupId: `${round}-group-${i / PUBLIC_GOODS_GROUP_SIZE + 1}`,
        groupSize: members.length, opponentAlias: 'Public goods group', role: 'first' };
    }
  }
  return assignments;
}

export function resolveResults(
  assignments: Record<string, Assignment>,
  choices: Record<string, Submission>,
  round: number,
  gameId: GameId = 1,
  offers: Record<string, VisibleOffer> = {},
): Record<string, MatchResult> {
  if (gameId === 12) return resolvePublicGoodsResults(assignments, choices, round);
  if (gameId === 7) return resolveAuctionResults(assignments, choices, round);
  if (gameId === 20) return resolveCentipedeResults(assignments, choices, round);
  if (gameId === 2 || gameId === 5) return resolveSequentialResults(assignments, choices, offers, round, gameId);
  if (gameId === 19) return resolveTrustResults(assignments, choices, offers, round);
  if (gameId === 30) return resolveUltimatumResults(assignments, choices, offers, round);
  const results: Record<string, MatchResult> = {};
  for (const [uid, assignment] of Object.entries(assignments)) {
    const ownChoice = choices[uid]?.round === round ? choices[uid].choice : null;
    if (!ownChoice || assignment.round !== round) continue;
    const partnerChoice = assignment.kind === 'student' && assignment.opponentUid && choices[assignment.opponentUid]?.round === round
      ? choices[assignment.opponentUid].choice
      : null;
    const fallback = assignment.kind === 'student' && !partnerChoice;
    const opponentChoice = partnerChoice || randomChoice(gameId);
    const [ownPoints, opponentPoints] = pointsFor(gameId, ownChoice, opponentChoice, assignment.role);
    results[uid] = {
      round,
      ownChoice,
      opponentChoice,
      ownPoints,
      opponentPoints,
      opponentAlias: fallback ? BOT_ALIAS : assignment.opponentAlias,
      opponentKind: fallback ? 'bot' : assignment.kind,
      fallback,
    };
  }
  return results;
}

function resolveAuctionResults(assignments: Record<string, Assignment>, choices: Record<string, Submission>, round: number): Record<string, MatchResult> {
  const results: Record<string, MatchResult> = {};
  for (const [uid, assignment] of Object.entries(assignments)) {
    const valuation = assignment.valuation;
    if (assignment.round !== round || valuation === undefined || !Number.isInteger(valuation) || valuation < 1 || valuation > 10) continue;
    const ownChoice = choices[uid]?.round === round ? choices[uid].choice : null;
    const ownBid = ownChoice ? auctionBid(ownChoice) : null;
    if (ownBid === null) continue;
    const partnerUid = assignment.kind === 'student' ? assignment.opponentUid : undefined;
    const partnerChoice = partnerUid && choices[partnerUid]?.round === round ? choices[partnerUid].choice : null;
    const validPartnerBid = partnerChoice ? auctionBid(partnerChoice) : null;
    const fallback = assignment.kind === 'student' && validPartnerBid === null;
    const otherBid = validPartnerBid ?? randomIndex(13);
    const otherValue = partnerUid && validPartnerBid !== null ? assignments[partnerUid]?.valuation : randomAuctionValue();
    const own = auctionPayoff(ownBid, otherBid, valuation, assignment.role !== 'second');
    const opponent = auctionPayoff(otherBid, ownBid, otherValue ?? randomAuctionValue(), assignment.role === 'second');
    results[uid] = { round, ownChoice: ownChoice!, opponentChoice: `Bid ${otherBid}`, ownPoints: own.points, opponentPoints: opponent.points,
      opponentAlias: fallback ? BOT_ALIAS : assignment.opponentAlias, opponentKind: fallback ? 'bot' : assignment.kind, fallback,
      auction: { valuation, winningBid: Math.max(ownBid, otherBid), price: Math.min(ownBid, otherBid), won: own.won } };
  }
  return results;
}

function resolveCentipedeResults(assignments: Record<string, Assignment>, choices: Record<string, Submission>, round: number): Record<string, MatchResult> {
  const results: Record<string, MatchResult> = {};
  for (const [uid, assignment] of Object.entries(assignments)) {
    if (assignment.round !== round) continue;
    const own = choices[uid]?.round === round ? choices[uid].choice : null;
    const first = assignment.role !== 'second';
    if (!own || !(first ? CENTIPEDE_FIRST : CENTIPEDE_SECOND).some(option => option === own)) continue;
    const partner = assignment.opponentUid && choices[assignment.opponentUid]?.round === round ? choices[assignment.opponentUid].choice : null;
    const validPartner = partner && (first ? CENTIPEDE_SECOND : CENTIPEDE_FIRST).some(option => option === partner);
    const counterpart = validPartner ? partner! : (first ? CENTIPEDE_SECOND : CENTIPEDE_FIRST)[randomIndex(4)];
    const fallback = assignment.kind === 'student' && !validPartner;
    const [ownPoints, opponentPoints] = pointsFor(20, own, counterpart, first ? 'first' : 'second');
    results[uid] = { round, ownChoice: own, opponentChoice: counterpart, ownPoints, opponentPoints,
      opponentAlias: fallback ? BOT_ALIAS : assignment.opponentAlias, opponentKind: fallback ? 'bot' : assignment.kind,
      fallback, exitNode: centipedeExitNode(first ? own : counterpart, first ? counterpart : own) };
  }
  return results;
}

// The instructor advances one node for every active pair in a single room transaction.
// A missing student's decision is supplied by a random bot for that turn.
export function advanceCentipede(room: LiveRoom, botMove: () => 'Take' | 'Pass' = () => Math.random() < 0.5 ? 'Take' : 'Pass'): LiveRoom | null {
  const config = room.config;
  if (!config || config.gameId !== 20 || config.phase !== 'playing') return null;
  const node = config.centipedeNode || 1;
  if (node < 1 || node > 6) return null;
  const paths = { ...(room.centipedePaths || {}) };
  const assignments = room.assignments || {};
  const decisions = room.centipedeDecisions || {};
  for (const [uid, assignment] of Object.entries(assignments)) {
    if (assignment.round !== config.round || assignment.role !== 'first') continue;
    const partnerUid = assignment.kind === 'student' ? assignment.opponentUid : undefined;
    const prior = paths[uid]?.round === config.round ? paths[uid] : { round: config.round, moves: {} };
    if (prior.exitNode) continue;
    const actorUid = node % 2 === 1 ? uid : partnerUid;
    const submitted = actorUid ? decisions[actorUid]?.[`n${node}`] : undefined;
    const valid = submitted?.round === config.round && (submitted.choice === 'Take' || submitted.choice === 'Pass');
    const move = valid ? submitted.choice : botMove();
    const next: CentipedePath = { round: config.round, moves: { ...prior.moves, [node]: move },
      ...(move === 'Take' || node === 6 ? { exitNode: move === 'Take' ? node : 7 } : {}),
      ...((prior.fallback || (actorUid && !valid)) ? { fallback: true } : {}) };
    paths[uid] = next;
    if (partnerUid) paths[partnerUid] = next;
  }
  return { ...room, centipedePaths: paths, config: { ...config, centipedeNode: node + 1 } };
}

export function centipedeTurnResults(room: LiveRoom): { choices: Record<string, Submission>; results: Record<string, MatchResult> } {
  const round = room.config?.round || 0;
  const choices: Record<string, Submission> = {};
  const results: Record<string, MatchResult> = {};
  for (const [uid, assignment] of Object.entries(room.assignments || {})) {
    const path = room.centipedePaths?.[uid];
    if (assignment.round !== round || path?.round !== round || !path.exitNode) continue;
    const first = assignment.role !== 'second';
    const ownNode = Object.entries(path.moves).find(([node, move]) => Number(node) % 2 === (first ? 1 : 0) && move === 'Take')?.[0];
    const otherNode = Object.entries(path.moves).find(([node, move]) => Number(node) % 2 === (first ? 0 : 1) && move === 'Take')?.[0];
    const ownChoice = ownNode ? `Take at Node ${ownNode}` as Choice : 'Pass All';
    const opponentChoice = otherNode ? `Take at Node ${otherNode}` as Choice : 'Pass All';
    const payoffs = [[2, 0], [1, 4], [4, 2], [3, 6], [6, 4], [5, 8], [8, 8]][path.exitNode - 1];
    const opponentKind = assignment.kind === 'student' && !path.fallback ? 'student' : 'bot';
    choices[uid] = { round, choice: ownChoice };
    results[uid] = { round, ownChoice, opponentChoice, ownPoints: payoffs[first ? 0 : 1], opponentPoints: payoffs[first ? 1 : 0],
      opponentAlias: opponentKind === 'student' ? assignment.opponentAlias : BOT_ALIAS, opponentKind, fallback: Boolean(path.fallback), exitNode: path.exitNode, centipedeMoves: path.moves };
  }
  return { choices, results };
}

export function advanceRepeated(room: LiveRoom, botMove: () => 'Cooperate' | 'Defect' = () => Math.random() < 0.5 ? 'Cooperate' : 'Defect'): LiveRoom | null {
  const config = room.config;
  if (!config || config.gameId !== 6 || config.phase !== 'playing') return null;
  const turn = config.repeatedTurn || 1;
  if (turn < 1 || turn > 5) return null;
  const paths = { ...(room.repeatedPaths || {}) };
  const decisions = room.repeatedDecisions || {};
  for (const [uid, assignment] of Object.entries(room.assignments || {})) {
    if (assignment.round !== config.round || assignment.role !== 'first') continue;
    const partnerUid = assignment.kind === 'student' ? assignment.opponentUid : undefined;
    const firstDecision = decisions[uid]?.[`t${turn}`];
    const secondDecision = partnerUid ? decisions[partnerUid]?.[`t${turn}`] : undefined;
    const valid = (item: Submission | undefined): item is Submission => item?.round === config.round && (item.choice === 'Cooperate' || item.choice === 'Defect');
    const first = valid(firstDecision) ? firstDecision.choice as 'Cooperate' | 'Defect' : botMove();
    const second = valid(secondDecision) ? secondDecision.choice as 'Cooperate' | 'Defect' : botMove();
    const bot = !valid(firstDecision) || !valid(secondDecision);
    const [firstPoints, secondPoints] = pointsFor(6, first, second);
    const priorFirst = paths[uid]?.round === config.round ? paths[uid].turns : {};
    paths[uid] = { round: config.round, turns: { ...priorFirst, [turn]: { own: first, other: second, ownPoints: firstPoints, otherPoints: secondPoints, bot } } };
    if (partnerUid) {
      const priorSecond = paths[partnerUid]?.round === config.round ? paths[partnerUid].turns : {};
      paths[partnerUid] = { round: config.round, turns: { ...priorSecond, [turn]: { own: second, other: first, ownPoints: secondPoints, otherPoints: firstPoints, bot } } };
    }
  }
  return { ...room, repeatedPaths: paths, config: { ...config, repeatedTurn: turn + 1 } };
}

export function repeatedTurnResults(room: LiveRoom): Record<string, MatchResult> {
  const round = room.config?.round || 0;
  const results: Record<string, MatchResult> = {};
  for (const [uid, assignment] of Object.entries(room.assignments || {})) {
    const path = room.repeatedPaths?.[uid];
    if (assignment.round !== round || path?.round !== round || !path.turns[5]) continue;
    const turns = Object.values(path.turns);
    const last = path.turns[5];
    const fallback = assignment.kind === 'student' && turns.some(item => item.bot);
    const opponentKind = assignment.kind === 'bot' || fallback ? 'bot' : 'student';
    results[uid] = { round, ownChoice: last.own, opponentChoice: last.other,
      ownPoints: turns.reduce((sum, item) => sum + item.ownPoints, 0), opponentPoints: turns.reduce((sum, item) => sum + item.otherPoints, 0),
      opponentAlias: opponentKind === 'bot' ? BOT_ALIAS : assignment.opponentAlias, opponentKind, fallback, repeatedTurns: path.turns };
  }
  return results;
}

export function summarizeRepeatedRound(room: LiveRoom, results: Record<string, MatchResult>): RoundSummary {
  const round = room.config?.round || 0;
  const assignments = room.assignments || {};
  const decisions = room.repeatedDecisions || {};
  const finished = Object.entries(results).filter(([, item]) => item.round === round);
  const choiceCounts = (['Cooperate', 'Defect'] as const).map(label => ({ label, count: Object.entries(decisions).reduce((sum, [uid, turns]) =>
    sum + (assignments[uid]?.round === round ? Object.values(turns).filter(item => item.round === round && item.choice === label).length : 0), 0) }));
  const outcomes = ['Both cooperate', 'Both defect', 'Different choices'].map(label => ({ label, count: 0 }));
  let studentPairs = 0;
  for (const [uid, assignment] of Object.entries(assignments)) {
    if (assignment.round !== round || assignment.kind !== 'student' || assignment.role !== 'first' || !assignment.opponentUid) continue;
    const first = results[uid], second = results[assignment.opponentUid];
    if (!first || !second || first.opponentKind !== 'student' || second.opponentKind !== 'student') continue;
    studentPairs++;
    for (const turn of Object.values(first.repeatedTurns || {})) outcomes[turn.own === turn.other ? turn.own === 'Cooperate' ? 0 : 1 : 2].count++;
  }
  const totalPoints = finished.reduce((sum, [, item]) => sum + item.ownPoints, 0);
  return { round, gameId: 6, submitted: finished.length, choiceCounts, studentPairs, outcomes,
    botMatches: finished.filter(([, item]) => item.opponentKind === 'bot').length,
    fallbacks: finished.filter(([, item]) => item.fallback).length,
    scoredStudents: finished.length, totalPoints, averagePoints: finished.length ? totalPoints / finished.length : null };
}

function resolvePublicGoodsResults(assignments: Record<string, Assignment>, choices: Record<string, Submission>, round: number): Record<string, MatchResult> {
  const groups = new Map<string, string[]>();
  for (const [uid, assignment] of Object.entries(assignments)) {
    if (assignment.kind !== 'group' || assignment.round !== round || !assignment.groupId) continue;
    groups.set(assignment.groupId, [...(groups.get(assignment.groupId) || []), uid]);
  }
  const results: Record<string, MatchResult> = {};
  for (const members of groups.values()) {
    const submitted = members.flatMap(uid => {
      const item = choices[uid];
      if (!item || item.round !== round) return [];
      const amount = contributionAmount(item.choice);
      return amount === null ? [] : [{ uid, amount, choice: item.choice }];
    });
    if (!submitted.length) continue;
    const bots = Math.max(0, PUBLIC_GOODS_GROUP_SIZE - submitted.length);
    const botContributions = Array.from({ length: bots }, () => randomIndex(11));
    const totalContribution = submitted.reduce((sum, item) => sum + item.amount, 0)
      + botContributions.reduce((sum, amount) => sum + amount, 0);
    const missing = members.length - submitted.length;
    for (const item of submitted) {
      results[item.uid] = { round, ownChoice: item.choice, ownPoints: publicGoodsPoints(item.amount, totalContribution),
        opponentAlias: 'Public goods group', opponentKind: 'group', fallback: missing > 0,
        group: { totalContribution, classmates: submitted.length - 1, bots, missing } };
    }
  }
  return results;
}

export function prepareUltimatumResponses(assignments: Record<string, Assignment>, choices: Record<string, Submission>, round: number): Record<string, VisibleOffer> {
  const offers: Record<string, VisibleOffer> = {};
  for (const [uid, assignment] of Object.entries(assignments)) {
    if (assignment.round !== round || assignment.role !== 'second') continue;
    const proposer = assignment.opponentUid && choices[assignment.opponentUid]?.round === round ? choices[assignment.opponentUid].choice : null;
    offers[uid] = { round, choice: proposer && offerAmount(proposer) !== null ? proposer : randomChoice(30), fromBot: !proposer || offerAmount(proposer) === null };
  }
  return offers;
}

export function prepareEntryResponses(assignments: Record<string, Assignment>, choices: Record<string, Submission>, round: number, gameId: 2 | 5 = 2): Record<string, VisibleOffer> {
  const offers: Record<string, VisibleOffer> = {};
  for (const [uid, assignment] of Object.entries(assignments)) {
    if (assignment.round !== round || assignment.role !== 'second') continue;
    const first = assignment.opponentUid && choices[assignment.opponentUid]?.round === round ? choices[assignment.opponentUid].choice : null;
    const valid = gameId === 2 ? first === 'Launch' || first === 'Wait' : first === 'Commit' || first === 'Stay Flexible';
    offers[uid] = { round, choice: valid ? first! : randomChoice(gameId), fromBot: !valid };
  }
  return offers;
}

function resolveSequentialResults(assignments: Record<string, Assignment>, choices: Record<string, Submission>, offers: Record<string, VisibleOffer>, round: number, gameId: 2 | 5): Record<string, MatchResult> {
  const results: Record<string, MatchResult> = {};
  for (const [uid, assignment] of Object.entries(assignments)) {
    if (assignment.round !== round) continue;
    const own = choices[uid]?.round === round ? choices[uid].choice : null;
    const firstMover = assignment.role !== 'second';
    if (!own || (firstMover ? gameId === 2 ? own !== 'Launch' && own !== 'Wait' : own !== 'Commit' && own !== 'Stay Flexible' : own !== 'Enter' && own !== 'Stay Out')) continue;
    const partner = assignment.opponentUid && choices[assignment.opponentUid]?.round === round ? choices[assignment.opponentUid].choice : null;
    const validPartner = firstMover ? partner === 'Enter' || partner === 'Stay Out' : gameId === 2 ? partner === 'Launch' || partner === 'Wait' : partner === 'Commit' || partner === 'Stay Flexible';
    const counterpart = firstMover ? validPartner ? partner! : Math.random() < 0.5 ? 'Enter' : 'Stay Out'
      : offers[uid]?.round === round ? offers[uid].choice : randomChoice(gameId);
    const fallback = assignment.kind === 'student' && (firstMover ? !validPartner : offers[uid]?.fromBot !== false);
    const [ownPoints, opponentPoints] = pointsFor(gameId, own, counterpart, firstMover ? 'first' : 'second');
    results[uid] = { round, ownChoice: own, opponentChoice: counterpart, ownPoints, opponentPoints,
      opponentAlias: fallback ? BOT_ALIAS : assignment.opponentAlias, opponentKind: fallback ? 'bot' : assignment.kind, fallback };
  }
  return results;
}

export function prepareTrustResponses(assignments: Record<string, Assignment>, choices: Record<string, Submission>, round: number): Record<string, VisibleOffer> {
  const offers: Record<string, VisibleOffer> = {};
  for (const [uid, assignment] of Object.entries(assignments)) {
    if (assignment.round !== round || assignment.role !== 'second') continue;
    const investor = assignment.opponentUid && choices[assignment.opponentUid]?.round === round ? choices[assignment.opponentUid].choice : null;
    offers[uid] = { round, choice: investor && investAmount(investor) !== null ? investor : randomChoice(19),
      fromBot: !investor || investAmount(investor) === null };
  }
  return offers;
}

function resolveTrustResults(assignments: Record<string, Assignment>, choices: Record<string, Submission>, offers: Record<string, VisibleOffer>, round: number): Record<string, MatchResult> {
  const results: Record<string, MatchResult> = {};
  for (const [uid, assignment] of Object.entries(assignments)) {
    if (assignment.round !== round) continue;
    const own = choices[uid]?.round === round ? choices[uid].choice : null;
    if (!own) continue;
    const investor = assignment.role !== 'second';
    const partner = assignment.opponentUid && choices[assignment.opponentUid]?.round === round ? choices[assignment.opponentUid].choice : null;
    const investment = investor ? own : offers[uid]?.round === round ? offers[uid].choice : null;
    if (!investment || investAmount(investment) === null) continue;
    const validPartner = partner && returnAmount(partner) !== null && returnAmount(partner)! <= 3 * investAmount(investment)!;
    const response = investor ? validPartner ? partner! : randomReturn(investAmount(investment)!) : own;
    if (returnAmount(response) === null || returnAmount(response)! > 3 * investAmount(investment)!) continue;
    const fallback = assignment.kind === 'student' && (investor ? !validPartner : offers[uid]?.fromBot !== false);
    const [investorPoints, trusteePoints] = trustPoints(investAmount(investment)!, returnAmount(response)!);
    results[uid] = { round, ownChoice: own, opponentChoice: investor ? response : investment,
      ownPoints: investor ? investorPoints : trusteePoints, opponentPoints: investor ? trusteePoints : investorPoints,
      opponentAlias: fallback ? BOT_ALIAS : assignment.opponentAlias, opponentKind: fallback ? 'bot' : assignment.kind, fallback };
  }
  return results;
}

function resolveUltimatumResults(assignments: Record<string, Assignment>, choices: Record<string, Submission>, offers: Record<string, VisibleOffer>, round: number): Record<string, MatchResult> {
  const results: Record<string, MatchResult> = {};
  for (const [uid, assignment] of Object.entries(assignments)) {
    if (assignment.round !== round) continue;
    const own = choices[uid]?.round === round ? choices[uid].choice : null;
    if (!own) continue;
    const proposer = assignment.role !== 'second';
    const partnerChoice = assignment.opponentUid && choices[assignment.opponentUid]?.round === round ? choices[assignment.opponentUid].choice : null;
    const counterpart = proposer ? partnerChoice && (partnerChoice === 'Accept' || partnerChoice === 'Reject') ? partnerChoice : Math.random() < 0.5 ? 'Accept' : 'Reject'
      : offers[uid]?.round === round ? offers[uid].choice : randomChoice(30);
    const fallback = assignment.kind === 'student' && (proposer ? !partnerChoice : offers[uid]?.fromBot !== false);
    const [ownPoints, opponentPoints] = pointsFor(30, own, counterpart, proposer ? 'first' : 'second');
    results[uid] = { round, ownChoice: own, opponentChoice: counterpart, ownPoints, opponentPoints,
      opponentAlias: fallback ? BOT_ALIAS : assignment.opponentAlias, opponentKind: fallback ? 'bot' : assignment.kind, fallback };
  }
  return results;
}

export function submissionProgress(
  participants: Record<string, Participant>,
  assignments: Record<string, Assignment>,
  choices: Record<string, Submission>,
  round: number,
) {
  const joined = Object.keys(participants).length;
  const submitted = Object.keys(participants).filter(uid =>
    assignments[uid]?.round === round && choices[uid]?.round === round).length;
  return { joined, submitted, allSubmitted: joined > 0 && submitted === joined };
}

function rpsOutcomeIndex(first: Choice, second: Choice): number {
  if (first === second) return 0;
  const choices = [first, second];
  if (choices.includes('Rock') && choices.includes('Scissors')) return 1;
  if (choices.includes('Paper') && choices.includes('Rock')) return 2;
  return 3;
}

export function summarizeRound(
  assignments: Record<string, Assignment>,
  choices: Record<string, Submission>,
  results: Record<string, MatchResult>,
  round: number,
  gameId: GameId,
): RoundSummary {
  if (gameId === 12) return summarizePublicGoodsRound(assignments, choices, results, round);
  const game = gameFor(gameId);
  const submitted = Object.entries(choices).filter(([uid, item]) =>
    item.round === round && assignments[uid]?.round === round);
  const finished = Object.entries(results).filter(([, item]) => item.round === round);
  const choiceCounts = game.options.map(option => ({
    label: option,
    count: submitted.filter(([, item]) => item.choice === option).length,
  }));

  const outcomeNames = gameId === 7 ? ['Winner gains points', 'Winner breaks even', 'Winner loses points']
    : gameId === 27 ? ['Healthy stock (0–8 boats)', 'Depleted stock (9–12 boats)', 'Overfished (13–20 boats)']
    : gameId === 19 ? ['Nothing returned', 'Some returned', 'All returned']
    : gameId === 20 ? ['Take at Node 1', 'Take at Node 2', 'Take at Node 3', 'Take at Node 4', 'Take at Node 5', 'Take at Node 6', 'Both pass all nodes']
    : gameId === 2 ? ['Launch + Enter', 'Launch + Stay Out', 'Wait + Enter', 'Wait + Stay Out']
    : gameId === 5 ? ['Commit + Enter', 'Commit + Stay Out', 'Stay Flexible + Enter', 'Stay Flexible + Stay Out']
    : gameId === 30 ? ['Accepted', 'Rejected']
    : gameId === 23 ? ['One student wins', 'Tie']
    : gameId === 1 ? ['Both cooperate', 'Both defect', 'Different choices']
    : gameId === 3 ? ['Both high price', 'Both low price', 'One station undercuts']
    : gameId === 13 ? ['Both hunt stag', 'Both hunt hare', 'Different choices']
    : gameId === 15 ? ['Both dove', 'Both hawk', 'Different choices']
    : gameId === 17 ? ['Matching choices', 'Different choices']
    : gameId === 4 ? ['Same day clash', 'Different days']
    : gameId === 29 ? ['Tie', 'Rock beats Scissors', 'Paper beats Rock', 'Scissors beats Paper']
    : ['Both opera', 'Both football', 'Different choices'];
  const outcomes = outcomeNames.map(label => ({ label, count: 0 }));
  let studentPairs = 0;
  for (const [uid, assignment] of Object.entries(assignments)) {
    if (assignment.round !== round || assignment.kind !== 'student' || !assignment.opponentUid || uid >= assignment.opponentUid) continue;
    const own = results[uid];
    const other = results[assignment.opponentUid];
    if (own?.round !== round || other?.round !== round || own.opponentKind !== 'student' || other.opponentKind !== 'student') continue;
    studentPairs++;
    const index = gameId === 7 ? (() => { const winner = own.auction?.won ? own : other; return winner.ownPoints > 0 ? 0 : winner.ownPoints < 0 ? 2 : 1; })()
      : gameId === 27 ? (() => { const total = (trawlerAmount(own.ownChoice) || 0) + (trawlerAmount(other.ownChoice) || 0); return total > 12 ? 2 : total > 8 ? 1 : 0; })()
      : gameId === 20 ? (own.exitNode || 7) - 1 : gameId === 19 ? (() => {
      const investor = assignment.role === 'first' ? own : other;
      const trustee = assignment.role === 'second' ? own : other;
      const invested = investAmount(investor.ownChoice) || 0;
      const returned = returnAmount(trustee.ownChoice) || 0;
      return returned === 0 ? 0 : returned === invested * 3 ? 2 : 1;
    })() : gameId === 2 || gameId === 5 ? (() => {
      const first = assignment.role === 'first' ? own.ownChoice : other.ownChoice;
      const second = assignment.role === 'second' ? own.ownChoice : other.ownChoice;
      return (gameId === 2 ? first === 'Launch' : first === 'Commit') ? second === 'Enter' ? 0 : 1 : second === 'Enter' ? 2 : 3;
    })() : gameId === 30 ? (own.ownChoice === 'Reject' || other.ownChoice === 'Reject' ? 1 : 0)
      : gameId === 23 ? (own.ownPoints === 0 ? 1 : 0)
      : gameId === 29 ? rpsOutcomeIndex(own.ownChoice, other.ownChoice)
      : gameId === 17 ? (own.ownChoice === other.ownChoice ? 0 : 1)
      : gameId === 4 ? (own.ownChoice === other.ownChoice ? 0 : 1)
      : own.ownChoice === other.ownChoice ? (own.ownChoice === game.options[0] ? 0 : 1) : 2;
    outcomes[index].count++;
  }

  const botMatches = finished.filter(([, item]) => item.opponentKind === 'bot').length;
  const fallbacks = finished.filter(([, item]) => item.fallback).length;
  const totalPoints = finished.reduce((total, [, item]) => total + item.ownPoints, 0);
  const scoredStudents = finished.length;
  const averagePoints = scoredStudents ? totalPoints / scoredStudents : null;
  const trustReturns = submitted.flatMap(([, item]) => returnAmount(item.choice) === null ? [] : [returnAmount(item.choice)!]);
  return { round, gameId, submitted: submitted.length, choiceCounts, studentPairs, outcomes, botMatches, fallbacks, scoredStudents, totalPoints, averagePoints,
    ...(gameId === 19 ? { averageReturn: trustReturns.length ? trustReturns.reduce((sum, value) => sum + value, 0) / trustReturns.length : null } : {}) };
}

function summarizePublicGoodsRound(assignments: Record<string, Assignment>, choices: Record<string, Submission>, results: Record<string, MatchResult>, round: number): RoundSummary {
  const submitted = Object.entries(choices).filter(([uid, item]) => item.round === round
    && assignments[uid]?.kind === 'group' && assignments[uid]?.round === round && contributionAmount(item.choice) !== null);
  const choiceCounts = PUBLIC_GOODS_CONTRIBUTIONS.map(option => ({ label: option,
    count: submitted.filter(([, item]) => item.choice === option).length }));
  const finished = Object.entries(results).filter(([, item]) => item.round === round && item.opponentKind === 'group' && item.group);
  const groups = new Map<string, MatchResult>();
  for (const [uid, item] of finished) {
    const groupId = assignments[uid]?.groupId;
    if (groupId && !groups.has(groupId)) groups.set(groupId, item);
  }
  const outcomes = ['Pool 0–9', 'Pool 10–19', 'Pool 20–29', 'Pool 30–40'].map(label => ({ label, count: 0 }));
  for (const item of groups.values()) {
    const index = Math.min(3, Math.floor((item.group?.totalContribution || 0) / 10));
    outcomes[index].count++;
  }
  const studentGroups = groups.size;
  const botSeats = Array.from(groups.values()).reduce((total, item) => total + (item.group?.bots || 0), 0);
  const fallbacks = Array.from(groups.values()).reduce((total, item) => total + (item.group?.missing || 0), 0);
  const totalPoints = finished.reduce((total, [, item]) => total + item.ownPoints, 0);
  const scoredStudents = finished.length;
  return { round, gameId: 12, submitted: submitted.length, choiceCounts, studentPairs: 0, studentGroups, outcomes,
    botMatches: 0, botSeats, fallbacks, scoredStudents, totalPoints,
    averagePoints: scoredStudents ? totalPoints / scoredStudents : null,
    averageContribution: submitted.length ? submitted.reduce((sum, [, item]) => sum + (contributionAmount(item.choice) || 0), 0) / submitted.length : null,
    averagePool: studentGroups ? Array.from(groups.values()).reduce((sum, item) => sum + (item.group?.totalContribution || 0), 0) / studentGroups : null };
}

export function finishRound(room: LiveRoom, revealNow: boolean): LiveRoom | null {
  const config = room.config;
  if (!config?.totalRounds || config.phase !== 'playing') return null;
  if ((config.gameId === 2 || config.gameId === 5 || config.gameId === 30 || config.gameId === 19) && config.step !== 'respond') return null;
  if (config.gameId === 20 && config.centipedeNode && config.centipedeNode !== 7) return null;
  if (config.gameId === 6 && config.repeatedTurn && config.repeatedTurn !== 6) return null;
  const round = config.round;
  const liveCentipede = config.gameId === 20 && config.centipedeNode === 7 ? centipedeTurnResults(room) : null;
  const roundChoices = liveCentipede?.choices || room.choices || {};
  const liveRepeated = config.gameId === 6 && config.repeatedTurn === 6 ? repeatedTurnResults(room) : null;
  const roundResults = liveRepeated || liveCentipede?.results || resolveResults(room.assignments || {}, roundChoices, round, config.gameId, room.offers || {});
  const summary = liveRepeated ? summarizeRepeatedRound(room, roundResults) : summarizeRound(room.assignments || {}, roundChoices, roundResults, round, config.gameId);
  const aliases = Object.fromEntries(Object.entries(room.participants || {}).map(([uid, participant]) => [uid, participant.alias]));
  const archive: Record<string, RoundArchive> = { ...(room.archive || {}), [round]: { summary, results: roundResults, aliases } };
  const isFinal = round >= config.totalRounds;
  const publishedResults = { ...(room.results || {}) } as Record<string, Record<string, MatchResult>>;
  const publishedSummaries = { ...(config.summaries || {}) };

  for (const [number, saved] of Object.entries(archive)) {
    if (!isFinal && (!revealNow || number !== String(round))) continue;
    publishedSummaries[number] = saved.summary;
    for (const [uid, result] of Object.entries(saved.results || {})) {
      publishedResults[uid] = { ...(publishedResults[uid] || {}), [number]: result };
    }
  }

  return {
    ...room,
    archive,
    results: publishedResults,
    assignments: isFinal || !revealNow ? null : room.assignments || null,
    choices: isFinal || !revealNow ? null : room.choices || null,
    offers: null,
    centipedeDecisions: null,
    centipedePaths: isFinal || !revealNow ? null : room.centipedePaths || null,
    repeatedDecisions: null,
    repeatedPaths: isFinal || !revealNow ? null : room.repeatedPaths || null,
    config: {
      ...config,
      summaries: publishedSummaries,
      phase: isFinal ? 'finished' : revealNow ? 'revealed' : 'lobby',
      round: isFinal || revealNow ? round : round + 1,
    },
  };
}

export function summarizeClass(summaries: RoundSummary[]) {
  const byGame = LIVE_GAMES.map(game => {
    const rounds = summaries.filter(item => item.gameId === game.id);
    const scoredStudents = rounds.reduce((total, item) => total + item.scoredStudents, 0);
    const totalPoints = rounds.reduce((total, item) => total + item.totalPoints, 0);
    return {
      gameId: game.id,
      rounds: rounds.length,
      submitted: rounds.reduce((total, item) => total + item.submitted, 0),
      studentPairs: rounds.reduce((total, item) => total + item.studentPairs, 0),
      studentGroups: rounds.reduce((total, item) => total + (item.studentGroups || 0), 0),
      botMatches: rounds.reduce((total, item) => total + item.botMatches, 0),
      botSeats: rounds.reduce((total, item) => total + (item.botSeats || 0), 0),
      choiceCounts: game.options.map(option => ({
        label: option,
        count: rounds.reduce((total, item) => total + (item.choiceCounts.find(choice => choice.label === option)?.count || 0), 0),
      })),
      averagePoints: scoredStudents ? totalPoints / scoredStudents : null,
    };
  }).filter(item => item.rounds > 0);
  return {
    rounds: summaries.length,
    submitted: summaries.reduce((total, item) => total + item.submitted, 0),
    studentPairs: summaries.reduce((total, item) => total + item.studentPairs, 0),
    studentGroups: summaries.reduce((total, item) => total + (item.studentGroups || 0), 0),
    botMatches: summaries.reduce((total, item) => total + item.botMatches, 0),
    botSeats: summaries.reduce((total, item) => total + (item.botSeats || 0), 0),
    byGame,
  };
}

export function summarizePerson(summaries: RoundSummary[], results: Record<string, MatchResult> = {}) {
  const rounds = summaries.map(summary => ({
    round: summary.round,
    gameId: summary.gameId,
    result: results[summary.round]?.round === summary.round ? results[summary.round] : null,
  }));
  const played = rounds.filter(item => item.result !== null);
  const byGame = LIVE_GAMES.map(game => {
    const gameRounds = rounds.filter(item => item.gameId === game.id);
    const gameResults = gameRounds.flatMap(item => item.result ? [item.result] : []);
    const totalPoints = gameResults.reduce((total, item) => total + item.ownPoints, 0);
    return {
      gameId: game.id,
      rounds: gameRounds.length,
      played: gameResults.length,
      averagePoints: gameResults.length ? totalPoints / gameResults.length : null,
      choices: (game.id === 19 ? ['Invested', 'Returned'] : game.options).map(option => {
        if (game.id === 6) {
          const turns = gameResults.flatMap(item => Object.values(item.repeatedTurns || {})).filter(item => item.own === option);
          return { label: option, count: turns.length,
            averagePoints: turns.length ? turns.reduce((total, item) => total + item.ownPoints, 0) / turns.length : null };
        }
        const chosen = gameResults.filter(item => game.id === 19
          ? option === 'Invested' ? investAmount(item.ownChoice) !== null : returnAmount(item.ownChoice) !== null
          : item.ownChoice === option);
        return {
          label: option,
          count: chosen.length,
          averagePoints: chosen.length ? chosen.reduce((total, item) => total + item.ownPoints, 0) / chosen.length : null,
        };
      }),
    };
  }).filter(item => item.rounds > 0);
  return {
    rounds,
    played: played.length,
    studentMatches: played.filter(item => item.result?.opponentKind === 'student').length,
    groupRounds: played.filter(item => item.result?.opponentKind === 'group').length,
    botMatches: played.filter(item => item.result?.opponentKind === 'bot').length,
    fallbacks: played.filter(item => item.result?.fallback).length,
    byGame,
  };
}

export function summarizePeople(summaries: RoundSummary[], archives: Record<string, RoundArchive>) {
  const people = new Map<string, { uid: string; alias: string; results: Record<string, MatchResult> }>();
  for (const summary of summaries) {
    const saved = archives[summary.round];
    if (!saved) continue;
    for (const uid of new Set([...Object.keys(saved.aliases || {}), ...Object.keys(saved.results || {})])) {
      const person = people.get(uid) || { uid, alias: 'Student who left', results: {} };
      person.alias = saved.aliases?.[uid] || person.alias;
      if (saved.results?.[uid]) person.results[summary.round] = saved.results[uid];
      people.set(uid, person);
    }
  }
  return Array.from(people.values())
    .map(person => ({ uid: person.uid, alias: person.alias, analysis: summarizePerson(summaries, person.results) }))
    .sort((a, b) => a.alias.localeCompare(b.alias) || a.uid.localeCompare(b.uid));
}

