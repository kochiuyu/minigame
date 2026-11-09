import test from 'node:test';
import assert from 'node:assert/strict';
import { computeWhatYouCouldHaveGot } from '../src/utils/counterfactualEngine.ts';

test('Centipede compares a Pass against the bot Take that actually happened', () => {
  const result = computeWhatYouCouldHaveGot(20, 'Pass at Node 1', 'Take at Node 2', 1, { centipedeNode: 1 });
  assert.equal(result.comparisonAvailable, true);
  assert.equal(result.bestPayoff, 2);
  assert.equal(result.bestActionLabel, 'Take at Node 1');
  assert.equal(result.difference, 1);
});

test('Centipede does not score an unplayed bot turn after Take', () => {
  const result = computeWhatYouCouldHaveGot(20, 'Take at Node 1', 'Passed previously', 2, { centipedeNode: 1 });
  assert.equal(result.comparisonAvailable, false);
  assert.equal(result.bestPayoff, 2);
  assert.equal(result.difference, 0);
});

test('Centipede compares a completed Pass path with Take at the same node', () => {
  const result = computeWhatYouCouldHaveGot(20, 'Pass at Node 5', 'Pass at Node 6', 6, { centipedeNode: 5 });
  assert.equal(result.comparisonAvailable, true);
  assert.equal(result.bestPayoff, 6);
  assert.equal(result.bestActionLabel, 'Pass at Node 5');
});
