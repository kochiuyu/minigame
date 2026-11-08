import test from 'node:test';
import assert from 'node:assert/strict';
import { LIVE_GAMES, pairParticipants, pointsFor, randomChoice, resolveResults, submissionProgress, summarizeRound } from '../src/liveMatch.ts';

const cases = [
  [1, [[2, 2], [0, 3], [3, 0], [1, 1]]],
  [13, [[10, 10], [0, 4], [4, 0], [4, 4]]],
  [15, [[3, 3], [0, 6], [6, 0], [-10, -10]]],
  [17, [[2, 0], [0, 2], [0, 2], [2, 0]]],
  [18, [[3, 2], [0, 0], [0, 0], [2, 3]]],
];

test('all live games use their published payoff matrices for both roles', () => {
  for (const [gameId, expected] of cases) {
    const [first, second] = LIVE_GAMES.find(game => game.id === gameId).options;
    const moves = [[first, first], [first, second], [second, first], [second, second]];
    moves.forEach(([own, other], index) => {
      assert.deepEqual(pointsFor(gameId, own, other, 'first'), expected[index]);
      const reverse = pointsFor(gameId, other, own, 'second');
      assert.deepEqual(reverse, [expected[index][1], expected[index][0]]);
    });
  }
});

test('random bot chooses only options in the selected game', () => {
  for (const game of LIVE_GAMES) {
    for (let i = 0; i < 20; i++) assert.ok(game.options.includes(randomChoice(game.id)));
  }
});

test('odd student gets bot; human pair roles and aliases are reciprocal', () => {
  const participants = Object.fromEntries(Array.from({ length: 9 }, (_, i) => [`student-${i}`, { alias: `Student ${i}` }]));
  const assignments = pairParticipants(participants, 2);
  assert.equal(Object.keys(assignments).length, 9);
  assert.equal(Object.values(assignments).filter(item => item.kind === 'bot').length, 1);
  for (const [uid, assignment] of Object.entries(assignments)) {
    assert.equal(assignment.round, 2);
    if (assignment.kind === 'bot') {
      assert.equal(assignment.role, 'first');
    } else {
      const other = assignments[assignment.opponentUid];
      assert.equal(other.opponentUid, uid);
      assert.equal(assignment.opponentAlias, participants[assignment.opponentUid].alias);
      assert.notEqual(assignment.role, other.role);
    }
  }
});

test('reveal gives reciprocal results and substitutes a bot for a missing partner', () => {
  const assignments = {
    a: { round: 1, kind: 'student', opponentUid: 'b', opponentAlias: 'B', role: 'first' },
    b: { round: 1, kind: 'student', opponentUid: 'a', opponentAlias: 'A', role: 'second' },
    c: { round: 1, kind: 'bot', opponentAlias: 'Random bot', role: 'first' },
  };
  const results = resolveResults(assignments, {
    a: { round: 1, choice: 'Opera' },
    b: { round: 1, choice: 'Opera' },
    c: { round: 1, choice: 'Football' },
  }, 1, 18);
  assert.deepEqual([results.a.ownPoints, results.a.opponentPoints], [3, 2]);
  assert.deepEqual([results.b.ownPoints, results.b.opponentPoints], [2, 3]);
  assert.equal(results.c.opponentKind, 'bot');
  assert.equal(results.c.fallback, false);

  const fallback = resolveResults(assignments, { a: { round: 1, choice: 'Opera' } }, 1, 18);
  assert.equal(fallback.a.fallback, true);
  assert.equal(fallback.a.opponentAlias, 'Random bot');
  assert.equal(fallback.b, undefined);
});

test('submission progress waits for every joined student, including a late arrival', () => {
  const participants = { a: { alias: 'A' }, b: { alias: 'B' } };
  const assignments = { a: { round: 2, kind: 'bot', opponentAlias: 'Random bot' } };
  const choices = { a: { round: 2, choice: 'Cooperate' } };
  assert.deepEqual(submissionProgress(participants, assignments, choices, 2), { joined: 2, submitted: 1, allSubmitted: false });
  assignments.b = { round: 2, kind: 'bot', opponentAlias: 'Random bot' };
  choices.b = { round: 2, choice: 'Defect' };
  assert.deepEqual(submissionProgress(participants, assignments, choices, 2), { joined: 2, submitted: 2, allSubmitted: true });
  assert.equal(submissionProgress(participants, assignments, choices, 3).allSubmitted, false);
});

test('post-reveal summary counts student pairs once and separates bot fallbacks', () => {
  const assignments = {
    a: { round: 1, kind: 'student', opponentUid: 'b', opponentAlias: 'B' },
    b: { round: 1, kind: 'student', opponentUid: 'a', opponentAlias: 'A' },
    c: { round: 1, kind: 'student', opponentUid: 'd', opponentAlias: 'D' },
    d: { round: 1, kind: 'student', opponentUid: 'c', opponentAlias: 'C' },
    e: { round: 1, kind: 'bot', opponentAlias: 'Random bot' },
  };
  const choices = Object.fromEntries(['a', 'b', 'c', 'e'].map(uid => [uid, { round: 1, choice: uid === 'c' ? 'Defect' : 'Cooperate' }]));
  const results = {
    a: { round: 1, ownChoice: 'Cooperate', ownPoints: 2, opponentKind: 'student', fallback: false },
    b: { round: 1, ownChoice: 'Cooperate', ownPoints: 2, opponentKind: 'student', fallback: false },
    c: { round: 1, ownChoice: 'Defect', ownPoints: 3, opponentKind: 'bot', fallback: true },
    e: { round: 1, ownChoice: 'Cooperate', ownPoints: 0, opponentKind: 'bot', fallback: false },
  };
  const summary = summarizeRound(assignments, choices, results, 1, 1);
  assert.deepEqual(summary.choiceCounts, [{ label: 'Cooperate', count: 3 }, { label: 'Defect', count: 1 }]);
  assert.deepEqual(summary.outcomes, [{ label: 'Both cooperate', count: 1 }, { label: 'Both defect', count: 0 }, { label: 'Different choices', count: 0 }]);
  assert.equal(summary.studentPairs, 1);
  assert.equal(summary.botMatches, 2);
  assert.equal(summary.fallbacks, 1);
  assert.equal(summary.averagePoints, 1.75);

  const pennies = summarizeRound(assignments, { a: { round: 1, choice: 'Heads' }, b: { round: 1, choice: 'Tails' } },
    { a: { round: 1, ownChoice: 'Heads', ownPoints: 0, opponentKind: 'student' }, b: { round: 1, ownChoice: 'Tails', ownPoints: 2, opponentKind: 'student' } }, 1, 17);
  assert.deepEqual(pennies.outcomes, [{ label: 'Matching choices', count: 0 }, { label: 'Different choices', count: 1 }]);
});
