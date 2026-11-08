import test from 'node:test';
import assert from 'node:assert/strict';
import { LIVE_GAMES, pairParticipants, pointsFor, randomChoice, resolveResults } from '../src/liveMatch.ts';

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

