import test from 'node:test';
import assert from 'node:assert/strict';
import { ALIAS_ICONS, LIVE_GAMES, finishRound, pairParticipants, pointsFor, prepareUltimatumResponses, randomChoice, randomStudentAlias, resolveResults, shuffleAliasIcon, submissionProgress, summarizeClass, summarizePeople, summarizePerson, summarizeRound } from '../src/liveMatch.ts';

test('ultimatum offers, acceptance and rejection score both roles', () => {
  for (let amount = 0; amount <= 10; amount++) {
    assert.deepEqual(pointsFor(30, `Offer ${amount}`, 'Accept', 'first'), [10 - amount, amount]);
    assert.deepEqual(pointsFor(30, 'Accept', `Offer ${amount}`, 'second'), [amount, 10 - amount]);
    assert.deepEqual(pointsFor(30, `Offer ${amount}`, 'Reject', 'first'), [0, 0]);
  }
});

test('ultimatum response step shares the offer, handles missing players, and archives results', () => {
  const assignments = {
    a: { round: 1, kind: 'student', opponentUid: 'b', opponentAlias: 'B', role: 'first' },
    b: { round: 1, kind: 'student', opponentUid: 'a', opponentAlias: 'A', role: 'second' },
    c: { round: 1, kind: 'student', opponentUid: 'd', opponentAlias: 'D', role: 'first' },
    d: { round: 1, kind: 'student', opponentUid: 'c', opponentAlias: 'C', role: 'second' },
  };
  const choices = { a: { round: 1, choice: 'Offer 3' }, b: { round: 1, choice: 'Accept' }, d: { round: 1, choice: 'Reject' } };
  const offers = prepareUltimatumResponses(assignments, choices, 1);
  assert.deepEqual(offers.b, { round: 1, choice: 'Offer 3', fromBot: false });
  assert.equal(offers.d.fromBot, true);
  const results = resolveResults(assignments, choices, 1, 30, offers);
  assert.deepEqual([results.a.ownPoints, results.b.ownPoints], [7, 3]);
  assert.equal(results.d.fallback, true);
  assert.equal(results.c, undefined);
  const finished = finishRound({ config: { round: 1, totalRounds: 1, phase: 'playing', step: 'respond', gameId: 30 },
    participants: { a: { alias: 'A' }, b: { alias: 'B' }, c: { alias: 'C' }, d: { alias: 'D' } }, assignments, choices, offers }, true);
  assert.equal(finished.config.phase, 'finished');
  assert.equal(finished.offers, null);
  assert.deepEqual(finished.config.summaries[1].outcomes, [{ label: 'Accepted', count: 1 }, { label: 'Rejected', count: 0 }]);
  assert.equal(finished.results.b[1].ownPoints, 3);
});

const cases = [
  [1, [[2, 2], [0, 3], [3, 0], [1, 1]]],
  [13, [[10, 10], [0, 4], [4, 0], [4, 4]]],
  [15, [[3, 3], [0, 6], [6, 0], [-10, -10]]],
  [17, [[2, 0], [0, 2], [0, 2], [2, 0]]],
  [18, [[3, 2], [0, 0], [0, 0], [2, 3]]],
];

test('two-choice live games use their published payoff matrices for both roles', () => {
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

test('Rock–Paper–Scissors scores every move and the bot can choose all three', () => {
  const moves = ['Rock', 'Paper', 'Scissors'];
  const expected = [
    [[1, 1], [0, 2], [2, 0]],
    [[2, 0], [1, 1], [0, 2]],
    [[0, 2], [2, 0], [1, 1]],
  ];
  assert.deepEqual(LIVE_GAMES.find(game => game.id === 29).options, moves);
  moves.forEach((own, i) => moves.forEach((other, j) => {
    assert.deepEqual(pointsFor(29, own, other), expected[i][j]);
    assert.deepEqual(pointsFor(29, other, own), [...expected[i][j]].reverse());
  }));
  const originalRandom = Math.random;
  try {
    assert.deepEqual([0, 0.34, 0.67].map(value => {
      Math.random = () => value;
      return randomChoice(29);
    }), moves);
  } finally {
    Math.random = originalRandom;
  }
});

test('Rock–Paper–Scissors round results count each pair outcome once', () => {
  const pairs = [['a', 'b', 'Rock', 'Rock'], ['c', 'd', 'Rock', 'Scissors'], ['e', 'f', 'Paper', 'Rock'], ['g', 'h', 'Scissors', 'Paper']];
  const assignments = {};
  const choices = {};
  for (const [first, second, firstChoice, secondChoice] of pairs) {
    assignments[first] = { round: 1, kind: 'student', opponentUid: second, opponentAlias: second, role: 'first' };
    assignments[second] = { round: 1, kind: 'student', opponentUid: first, opponentAlias: first, role: 'second' };
    choices[first] = { round: 1, choice: firstChoice };
    choices[second] = { round: 1, choice: secondChoice };
  }
  const results = resolveResults(assignments, choices, 1, 29);
  const summary = summarizeRound(assignments, choices, results, 1, 29);
  assert.deepEqual(summary.choiceCounts, [{ label: 'Rock', count: 4 }, { label: 'Paper', count: 2 }, { label: 'Scissors', count: 2 }]);
  assert.deepEqual(summary.outcomes, [
    { label: 'Tie', count: 1 },
    { label: 'Rock beats Scissors', count: 1 },
    { label: 'Paper beats Rock', count: 1 },
    { label: 'Scissors beats Paper', count: 1 },
  ]);
  assert.equal(summary.studentPairs, 4);
  assert.equal(summary.averagePoints, 1);
  const finished = finishRound({ config: { round: 1, totalRounds: 1, phase: 'playing', gameId: 29 },
    participants: Object.fromEntries(Object.keys(assignments).map(uid => [uid, { alias: uid }])), assignments, choices }, false);
  assert.equal(finished.config.phase, 'finished');
  assert.equal(finished.config.summaries[1].outcomes.length, 4);
  assert.equal(finished.results.c[1].ownPoints, 2);
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

test('hidden rounds stay private until the final round publishes every result', () => {
  const students = { a: { alias: 'A' }, b: { alias: 'B' } };
  const first = {
    config: { round: 1, totalRounds: 2, phase: 'playing', gameId: 1 },
    participants: students,
    assignments: {
      a: { round: 1, kind: 'student', opponentUid: 'b', opponentAlias: 'B', role: 'first' },
      b: { round: 1, kind: 'student', opponentUid: 'a', opponentAlias: 'A', role: 'second' },
    },
    choices: { a: { round: 1, choice: 'Cooperate' }, b: { round: 1, choice: 'Defect' } },
  };
  const hidden = finishRound(first, false);
  assert.equal(hidden.config.phase, 'lobby');
  assert.equal(hidden.config.round, 2);
  assert.equal(hidden.config.summaries[1], undefined);
  assert.equal(hidden.results.a, undefined);
  assert.equal(hidden.archive[1].summary.submitted, 2);
  assert.equal(hidden.assignments, null);
  assert.equal(hidden.choices, null);

  const second = finishRound({ ...hidden,
    config: { ...hidden.config, phase: 'playing', gameId: 13 },
    assignments: {
      a: { round: 2, kind: 'student', opponentUid: 'b', opponentAlias: 'B', role: 'first' },
      b: { round: 2, kind: 'student', opponentUid: 'a', opponentAlias: 'A', role: 'second' },
    },
    choices: { a: { round: 2, choice: 'Hunt Stag' }, b: { round: 2, choice: 'Hunt Stag' } },
  }, false);
  assert.equal(second.config.phase, 'finished');
  assert.deepEqual(Object.keys(second.config.summaries).sort(), ['1', '2']);
  assert.deepEqual(Object.keys(second.results.a).sort(), ['1', '2']);
  assert.equal(second.results.a[1].ownPoints, 0);
  assert.equal(second.results.a[2].ownPoints, 10);
  assert.equal(second.archive[1].aliases.a, 'A');
});

test('a revealed round publishes only that round before class completion', () => {
  const room = {
    config: { round: 1, totalRounds: 3, phase: 'playing', gameId: 17 },
    participants: { a: { alias: 'A' }, b: { alias: 'B' } },
    assignments: {
      a: { round: 1, kind: 'student', opponentUid: 'b', opponentAlias: 'B', role: 'first' },
      b: { round: 1, kind: 'student', opponentUid: 'a', opponentAlias: 'A', role: 'second' },
    },
    choices: { a: { round: 1, choice: 'Heads' }, b: { round: 1, choice: 'Tails' } },
  };
  const revealed = finishRound(room, true);
  assert.equal(revealed.config.phase, 'revealed');
  assert.equal(revealed.config.round, 1);
  assert.equal(revealed.config.summaries[1].outcomes[1].count, 1);
  assert.equal(revealed.results.a[1].ownPoints, 0);
  assert.equal(revealed.results.b[1].ownPoints, 2);
  assert.equal(finishRound(revealed, true), null);
  assert.equal(finishRound({ ...room, config: { round: 1, phase: 'playing', gameId: 17 } }, true), null);
});

test('final analysis groups games and weights scores by submitted results', () => {
  const rounds = [
    { gameId: 1, submitted: 2, studentPairs: 1, botMatches: 0, scoredStudents: 2, totalPoints: 4, choiceCounts: [{ label: 'Cooperate', count: 2 }, { label: 'Defect', count: 0 }] },
    { gameId: 1, submitted: 1, studentPairs: 0, botMatches: 1, scoredStudents: 1, totalPoints: 3, choiceCounts: [{ label: 'Cooperate', count: 0 }, { label: 'Defect', count: 1 }] },
    { gameId: 13, submitted: 2, studentPairs: 1, botMatches: 0, scoredStudents: 2, totalPoints: 20, choiceCounts: [{ label: 'Hunt Stag', count: 2 }, { label: 'Hunt Hare', count: 0 }] },
  ];
  const total = summarizeClass(rounds);
  assert.deepEqual([total.rounds, total.submitted, total.studentPairs, total.botMatches], [3, 5, 2, 1]);
  assert.deepEqual(total.byGame.map(item => [item.gameId, item.averagePoints]), [[1, 7 / 3], [13, 10]]);
  assert.deepEqual(total.byGame[0].choiceCounts, [{ label: 'Cooperate', count: 2 }, { label: 'Defect', count: 1 }]);
});

test('personal analysis keeps game scores separate and includes missed rounds', () => {
  const summaries = [
    { round: 1, gameId: 1 },
    { round: 2, gameId: 1 },
    { round: 3, gameId: 15 },
    { round: 4, gameId: 15 },
  ];
  const analysis = summarizePerson(summaries, {
    1: { round: 1, ownChoice: 'Cooperate', ownPoints: 2, opponentKind: 'student', fallback: false },
    2: { round: 2, ownChoice: 'Defect', ownPoints: 3, opponentKind: 'bot', fallback: true },
    3: { round: 3, ownChoice: 'Hawk', ownPoints: -10, opponentKind: 'student', fallback: false },
  });
  assert.deepEqual([analysis.played, analysis.studentMatches, analysis.botMatches, analysis.fallbacks], [3, 2, 1, 1]);
  assert.equal(analysis.rounds[3].result, null);
  assert.deepEqual(analysis.byGame.map(item => [item.gameId, item.played, item.averagePoints]), [[1, 2, 2.5], [15, 1, -10]]);
  assert.deepEqual(analysis.byGame[0].choices.map(item => [item.label, item.count, item.averagePoints]), [['Cooperate', 1, 2], ['Defect', 1, 3]]);
  assert.deepEqual(analysis.byGame[1].choices.map(item => [item.label, item.count, item.averagePoints]), [['Dove', 0, null], ['Hawk', 1, -10]]);
});

test('instructor analysis joins students across rounds by uid even when aliases change', () => {
  const summaries = [{ round: 1, gameId: 1 }, { round: 2, gameId: 13 }];
  const archives = {
    1: {
      aliases: { a: 'Fox', b: 'Bee' },
      results: { a: { round: 1, ownChoice: 'Cooperate', ownPoints: 2, opponentKind: 'student', fallback: false } },
    },
    2: {
      aliases: { a: 'Otter', c: 'Cat' },
      results: { a: { round: 2, ownChoice: 'Hunt Stag', ownPoints: 10, opponentKind: 'bot', fallback: false } },
    },
  };
  const people = summarizePeople(summaries, archives);
  assert.deepEqual(people.map(item => [item.alias, item.analysis.played]), [['Bee', 0], ['Cat', 0], ['Otter', 2]]);
  assert.deepEqual(people.find(item => item.uid === 'a').analysis.rounds.map(item => item.result?.ownPoints), [2, 10]);
});

test('a round with no choices can be skipped and does not break final release', () => {
  const empty = finishRound({
    config: { round: 1, totalRounds: 2, phase: 'playing', gameId: 1 },
    participants: { a: { alias: 'A' } },
    assignments: { a: { round: 1, kind: 'bot', opponentAlias: 'Random bot', role: 'first' } },
  }, false);
  assert.equal(empty.archive[1].summary.averagePoints, null);
  const saved = { ...empty.archive[1] };
  delete saved.results; // Empty objects are omitted when Firebase reads the archive back.
  const done = finishRound({
    ...empty,
    archive: { 1: saved },
    config: { ...empty.config, phase: 'playing' },
    assignments: { a: { round: 2, kind: 'bot', opponentAlias: 'Random bot', role: 'first' } },
    choices: { a: { round: 2, choice: 'Defect' } },
  }, true);
  assert.equal(done.config.phase, 'finished');
  assert.equal(done.config.summaries[1].submitted, 0);
  assert.equal(done.results.a[2].round, 2);
});

test('students can generate a short emoji alias and change its icon before joining', () => {
  for (let i = 0; i < 100; i++) {
    const alias = randomStudentAlias();
    const originalIcon = ALIAS_ICONS.find(icon => alias.startsWith(`${icon} `));
    assert.ok(originalIcon);
    assert.ok(alias.length <= 30);
    assert.match(alias, / [1-9][0-9]{2}$/);
    const changed = shuffleAliasIcon(alias);
    assert.ok(changed.length <= 30);
    assert.notEqual(changed.split(' ')[0], originalIcon);
    assert.equal(changed.slice(changed.indexOf(' ') + 1), alias.slice(alias.indexOf(' ') + 1));
  }
  assert.ok(shuffleAliasIcon('A'.repeat(30)).length <= 30);
});
