export type GameId = 1 | 13 | 15 | 17 | 18;
export type Choice = 'Cooperate' | 'Defect' | 'Hunt Stag' | 'Hunt Hare' | 'Dove' | 'Hawk' | 'Heads' | 'Tails' | 'Opera' | 'Football';
export type Role = 'first' | 'second';
export type RoomConfig = {
  round: number;
  phase: 'lobby' | 'playing' | 'revealed' | 'finished';
  gameId: GameId;
  totalRounds?: number; // Absent in classes started before round limits were added.
  summaries?: Record<string, RoundSummary>; // Only rounds released to students.
};
export type Participant = { alias: string };
export type Assignment = {
  round: number;
  kind: 'student' | 'bot';
  opponentAlias: string;
  opponentUid?: string;
  role?: Role;
};
export type Submission = { round: number; choice: Choice };
export type MatchResult = {
  round: number;
  ownChoice: Choice;
  opponentChoice: Choice;
  ownPoints: number;
  opponentPoints: number;
  opponentAlias: string;
  opponentKind: 'student' | 'bot';
  fallback: boolean;
};
export type RoundSummary = {
  round: number;
  gameId: GameId;
  submitted: number;
  choiceCounts: Array<{ label: Choice; count: number }>;
  studentPairs: number;
  outcomes: Array<{ label: string; count: number }>;
  botMatches: number;
  fallbacks: number;
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
  results?: Record<string, MatchResult | Record<string, MatchResult>>;
  archive?: Record<string, RoundArchive>;
};

export const BOT_ALIAS = 'Random bot';
export const LIVE_GAMES: ReadonlyArray<{
  id: GameId;
  title: string;
  options: readonly [Choice, Choice];
  payoffs: string;
  roles?: readonly [string, string];
}> = [
  { id: 1, title: "Prisoner's Dilemma", options: ['Cooperate', 'Defect'], payoffs: 'Both Cooperate: 2 each · Both Defect: 1 each · Defect against Cooperate: 3–0' },
  { id: 13, title: 'Stag Hunt', options: ['Hunt Stag', 'Hunt Hare'], payoffs: 'Both Stag: 10 each · Both Hare: 4 each · Stag against Hare: 0–4' },
  { id: 15, title: 'Hawk–Dove', options: ['Dove', 'Hawk'], payoffs: 'Both Dove: 3 each · Both Hawk: −10 each · Hawk against Dove: 6–0' },
  { id: 17, title: 'Matching Pennies', options: ['Heads', 'Tails'], payoffs: 'Same choices: Matcher 2, Mismatcher 0 · Different choices: Matcher 0, Mismatcher 2', roles: ['Matcher', 'Mismatcher'] },
  { id: 18, title: 'Battle of the Sexes', options: ['Opera', 'Football'], payoffs: 'Both Opera: Opera fan 3, Football fan 2 · Both Football: Opera fan 2, Football fan 3 · Different choices: 0 each', roles: ['Opera fan', 'Football fan'] },
];

export function gameFor(id?: GameId): (typeof LIVE_GAMES)[number] {
  return LIVE_GAMES.find(game => game.id === id) || LIVE_GAMES[0];
}

export function randomChoice(gameId: GameId = 1): Choice {
  const options = gameFor(gameId).options;
  return options[Math.random() < 0.5 ? 0 : 1];
}

export function pointsFor(gameId: GameId, own: Choice, other: Choice, role: Role = 'first'): [number, number] {
  switch (gameId) {
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

export function resolveResults(
  assignments: Record<string, Assignment>,
  choices: Record<string, Submission>,
  round: number,
  gameId: GameId = 1,
): Record<string, MatchResult> {
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

export function summarizeRound(
  assignments: Record<string, Assignment>,
  choices: Record<string, Submission>,
  results: Record<string, MatchResult>,
  round: number,
  gameId: GameId,
) {
  const game = gameFor(gameId);
  const submitted = Object.entries(choices).filter(([uid, item]) =>
    item.round === round && assignments[uid]?.round === round);
  const finished = Object.entries(results).filter(([, item]) => item.round === round);
  const choiceCounts = game.options.map(option => ({
    label: option,
    count: submitted.filter(([, item]) => item.choice === option).length,
  }));

  const outcomeNames = gameId === 1 ? ['Both cooperate', 'Both defect', 'Different choices']
    : gameId === 13 ? ['Both hunt stag', 'Both hunt hare', 'Different choices']
    : gameId === 15 ? ['Both dove', 'Both hawk', 'Different choices']
    : gameId === 17 ? ['Matching choices', 'Different choices']
    : ['Both opera', 'Both football', 'Different choices'];
  const outcomes = outcomeNames.map(label => ({ label, count: 0 }));
  let studentPairs = 0;
  for (const [uid, assignment] of Object.entries(assignments)) {
    if (assignment.round !== round || assignment.kind !== 'student' || !assignment.opponentUid || uid >= assignment.opponentUid) continue;
    const own = results[uid];
    const other = results[assignment.opponentUid];
    if (own?.round !== round || other?.round !== round || own.opponentKind !== 'student' || other.opponentKind !== 'student') continue;
    studentPairs++;
    const index = gameId === 17 ? (own.ownChoice === other.ownChoice ? 0 : 1)
      : own.ownChoice === other.ownChoice ? (own.ownChoice === game.options[0] ? 0 : 1) : 2;
    outcomes[index].count++;
  }

  const botMatches = finished.filter(([, item]) => item.opponentKind === 'bot').length;
  const fallbacks = finished.filter(([, item]) => item.fallback).length;
  const totalPoints = finished.reduce((total, [, item]) => total + item.ownPoints, 0);
  const scoredStudents = finished.length;
  const averagePoints = scoredStudents ? totalPoints / scoredStudents : null;
  return { round, gameId, submitted: submitted.length, choiceCounts, studentPairs, outcomes, botMatches, fallbacks, scoredStudents, totalPoints, averagePoints };
}

export function finishRound(room: LiveRoom, revealNow: boolean): LiveRoom | null {
  const config = room.config;
  if (!config?.totalRounds || config.phase !== 'playing') return null;
  const round = config.round;
  const roundResults = resolveResults(room.assignments || {}, room.choices || {}, round, config.gameId);
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
      botMatches: rounds.reduce((total, item) => total + item.botMatches, 0),
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
    botMatches: summaries.reduce((total, item) => total + item.botMatches, 0),
    byGame,
  };
}
