import test from 'node:test';
import assert from 'node:assert/strict';
import { buildReportCsv } from '../src/reportExport.ts';

const summary = {
  round: 1, gameId: 1, submitted: 2, studentPairs: 1, botMatches: 0,
  fallbacks: 0, scoredStudents: 2, totalPoints: 3, averagePoints: 1.5,
  choiceCounts: [{ label: 'Cooperate', count: 1 }, { label: 'Defect', count: 1 }],
  outcomes: [{ label: 'One defects', count: 1 }],
};
const first = { round: 1, ownChoice: 'Cooperate', ownPoints: 0, opponentAlias: '=other',
  opponentChoice: 'Defect', opponentPoints: 3, opponentKind: 'student', fallback: false };
const second = { round: 1, ownChoice: 'Defect', ownPoints: 3, opponentAlias: 'First',
  opponentChoice: 'Cooperate', opponentPoints: 0, opponentKind: 'student', fallback: false };
const title = () => "Prisoner's Dilemma";

test('instructor export includes aggregate rows and every student result safely', () => {
  const csv = buildReportCsv(title, [summary], { 1: { summary, aliases: { one: 'First', two: '=other' }, results: { one: first, two: second } } });
  assert.match(csv, /"Round summary","1","Prisoner's Dilemma"/);
  assert.match(csv, /"Choice count","1","Prisoner's Dilemma","","Cooperate","1"/);
  assert.match(csv, /"Student result","1","Prisoner's Dilemma","First","Cooperate"/);
  assert.match(csv, /"'=other"/);
  assert.match(csv, /"0","3","student","No"/);
});

test('student export contains only that student’s result', () => {
  const csv = buildReportCsv(title, [summary], undefined, { 1: first }, 'First');
  assert.match(csv, /"Student result","1","Prisoner's Dilemma","First","Cooperate"/);
  assert.doesNotMatch(csv, /"Student result","1","Prisoner's Dilemma","'=other"/);
  assert.equal((csv.match(/"Student result"/g) || []).length, 1);
});
