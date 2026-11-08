export type GameId = 1 | 12 | 13 | 15 | 17 | 18 | 19 | 29 | 30;
export type Choice = 'Cooperate' | 'Defect' | 'Hunt Stag' | 'Hunt Hare' | 'Dove' | 'Hawk' | 'Heads' | 'Tails' | 'Opera' | 'Football' | 'Rock' | 'Paper' | 'Scissors' | 'Accept' | 'Reject' | `Offer ${number}` | `Contribute ${number}` | `Invest ${number}` | `Return ${number}`;
export type Role = 'first' | 'second';
export type RoomConfig = {
  round: number;
  phase: 'lobby' | 'playing' | 'revealed' | 'finished';
  gameId: GameId;
  step?: 'offer' | 'respond'; // Also used for Trust Game: invest, then return.
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
};
export type Submission = { round: number; choice: Choice };
export type VisibleOffer = { round: number; choice: Choice; fromBot: boolean };
export type MatchResult = {
  round: number;
  ownChoice: Choice;
  opponentChoice?: Choice;
  ownPoints: number;
  opponentPoints?: number;
  opponentAlias: string;
  opponentKind: 'student' | 'bot' | 'group';
  fallback: boolean;
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
export const PUBLIC_GOODS_CONTRIBUTIONS = Array.from({ length: 11 }, (_, index) => `Contribute ${index}` as Choice) as [Choice, Choice, ...Choice[]];
export const TRUST_INVESTMENTS = Array.from({ length: 11 }, (_, index) => `Invest ${index}` as Choice) as [Choice, Choice, ...Choice[]];
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
  { id: 12, title: 'Public Goods Game', options: PUBLIC_GOODS_CONTRIBUTIONS, rules: 'Each of four players starts with 10 points and secretly contributes 0–10 to a shared pool. Random bots fill empty seats.', payoffs: 'The pool is multiplied by 1.6 and split equally. Your score = 10 − your contribution + 0.4 × total pool.' },
  { id: 13, title: 'Stag Hunt', options: ['Hunt Stag', 'Hunt Hare'], rules: 'You and the bot each choose a hunt. Stag pays most when you both choose it; Hare is the safer choice.', payoffs: 'Both Stag: 10 each · Both Hare: 4 each · Stag against Hare: 0–4' },
  { id: 15, title: 'Hawk–Dove', options: ['Dove', 'Hawk'], rules: 'You and the bot each choose Dove or Hawk. Hawk gains against Dove, but two Hawks both lose points.', payoffs: 'Both Dove: 3 each · Both Hawk: −10 each · Hawk against Dove: 6–0' },
  { id: 17, title: 'Matching Pennies', options: ['Heads', 'Tails'], rules: 'Both choose Heads or Tails. The Matcher scores when the choices match; the Mismatcher scores when they differ.', payoffs: 'Same choices: Matcher 2, Mismatcher 0 · Different choices: Matcher 0, Mismatcher 2', roles: ['Matcher', 'Mismatcher'] },
  { id: 18, title: 'Battle of the Sexes', options: ['Opera', 'Football'], rules: 'Both choose Opera or Football. You score only if your choices match; each role prefers a different match.', payoffs: 'Both Opera: Opera fan 3, Football fan 2 · Both Football: Opera fan 2, Football fan 3 · Different choices: 0 each', roles: ['Opera fan', 'Football fan'] },
  { id: 19, title: 'Trust Game', options: TRUST_INVESTMENTS, rules: 'The Investor starts with 10 points and sends 0–10 to the Trustee. The amount sent triples. The Trustee then chooses how much of the tripled amount to return.', payoffs: 'Investor score = 10 − amount invested + amount returned. Trustee score = 3 × amount invested − amount returned.', roles: ['Investor', 'Trustee'] },
  { id: 29, title: 'Rock–Paper–Scissors', options: ['Rock', 'Paper', 'Scissors'], rules: 'You and the bot each choose one move without seeing the other choice. Each move beats one other move.', payoffs: 'Rock beats Scissors · Paper beats Rock · Scissors beats Paper · Winner: 2 points, loser: 0 · Tie: 1 point each' },
  { id: 30, title: 'Ultimatum Game', options: [...ULTIMATUM_OFFERS, 'Accept', 'Reject'], rules: 'The Proposer offers part of a 10-point pot. The Responder sees the offer and accepts or rejects it.', payoffs: 'Proposer offers 0–10 points from a pot of 10, in half-point steps. Responder accepts (split as offered) or rejects (both get 0).', roles: ['Proposer', 'Responder'] },
];

export function gameFor(id?: GameId): (typeof LIVE_GAMES)[number] {
  return LIVE_GAMES.find(game => game.id === id) || LIVE_GAMES[0];
}

export function randomChoice(gameId: GameId = 1): Choice {
  const options = gameId === 30 ? ULTIMATUM_OFFERS : gameFor(gameId).options;
  return options[randomIndex(options.length)];
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
    case 12:
      throw new Error('Public Goods requires a four-player group pool.');
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
      if (own === 'Cooperate' && other === 'Cooperate') return [2, 2];
      if (own === 'Defect' && other === 'Defect') return [1, 1];
      return own === 'Defect' ? [3, 0] : [0, 3];
  }
}

export function pairParticipants(participants: Record<string, Participant>, round: number): Record<string, Assignment> {
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
      assignments[first] = { round, kind: 'bot', opponentAlias: BOT_ALIAS, role: 'first' };
    } else {
      assignments[first] = { round, kind: 'student', opponentUid: second, opponentAlias: participants[second].alias, role: 'first' };
      assignments[second] = { round, kind: 'student', opponentUid: first, opponentAlias: participants[first].alias, role: 'second' };
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

  const outcomeNames = gameId === 19 ? ['Nothing returned', 'Some returned', 'All returned']
    : gameId === 30 ? ['Accepted', 'Rejected']
    : gameId === 1 ? ['Both cooperate', 'Both defect', 'Different choices']
    : gameId === 13 ? ['Both hunt stag', 'Both hunt hare', 'Different choices']
    : gameId === 15 ? ['Both dove', 'Both hawk', 'Different choices']
    : gameId === 17 ? ['Matching choices', 'Different choices']
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
    const index = gameId === 19 ? (() => {
      const investor = assignment.role === 'first' ? own : other;
      const trustee = assignment.role === 'second' ? own : other;
      const invested = investAmount(investor.ownChoice) || 0;
      const returned = returnAmount(trustee.ownChoice) || 0;
      return returned === 0 ? 0 : returned === invested * 3 ? 2 : 1;
    })() : gameId === 30 ? (own.ownChoice === 'Reject' || other.ownChoice === 'Reject' ? 1 : 0)
      : gameId === 29 ? rpsOutcomeIndex(own.ownChoice, other.ownChoice)
      : gameId === 17 ? (own.ownChoice === other.ownChoice ? 0 : 1)
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
  if ((config.gameId === 30 || config.gameId === 19) && config.step !== 'respond') return null;
  const round = config.round;
  const roundResults = resolveResults(room.assignments || {}, room.choices || {}, round, config.gameId, room.offers || {});
  const summary = summarizeRound(room.assignments || {}, room.choices || {}, roundResults, round, config.gameId);
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
