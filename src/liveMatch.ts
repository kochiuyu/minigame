export type Choice = 'Cooperate' | 'Defect';
export type RoomConfig = { round: number; phase: 'lobby' | 'playing' | 'revealed' };
export type Participant = { alias: string };
export type Assignment = {
  round: number;
  kind: 'student' | 'bot';
  opponentAlias: string;
  opponentUid?: string;
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

export const BOT_ALIAS = 'Random bot';

export function randomChoice(): Choice {
  return Math.random() < 0.5 ? 'Cooperate' : 'Defect';
}

export function pointsFor(own: Choice, other: Choice): [number, number] {
  if (own === 'Cooperate' && other === 'Cooperate') return [2, 2];
  if (own === 'Defect' && other === 'Defect') return [1, 1];
  return own === 'Defect' ? [3, 0] : [0, 3];
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
      assignments[first] = { round, kind: 'bot', opponentAlias: BOT_ALIAS };
    } else {
      assignments[first] = { round, kind: 'student', opponentUid: second, opponentAlias: participants[second].alias };
      assignments[second] = { round, kind: 'student', opponentUid: first, opponentAlias: participants[first].alias };
    }
  }
  return assignments;
}

export function resolveResults(
  assignments: Record<string, Assignment>,
  choices: Record<string, Submission>,
  round: number,
): Record<string, MatchResult> {
  const results: Record<string, MatchResult> = {};
  for (const [uid, assignment] of Object.entries(assignments)) {
    const ownChoice = choices[uid]?.round === round ? choices[uid].choice : null;
    if (!ownChoice || assignment.round !== round) continue;
    const partnerChoice = assignment.kind === 'student' && assignment.opponentUid && choices[assignment.opponentUid]?.round === round
      ? choices[assignment.opponentUid].choice
      : null;
    const fallback = assignment.kind === 'student' && !partnerChoice;
    const opponentChoice = partnerChoice || randomChoice();
    const [ownPoints, opponentPoints] = pointsFor(ownChoice, opponentChoice);
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

