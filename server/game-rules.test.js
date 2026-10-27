import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateScore, getDifficultyRules } from './game-rules.js';

test('difficulty rules match the project guide', () => {
  assert.deepEqual(getDifficultyRules('Easy'), { suspects: 3, clues: 5, hints: 2, basePoints: 100 });
  assert.deepEqual(getDifficultyRules('Medium'), { suspects: 4, clues: 7, hints: 3, basePoints: 150 });
  assert.deepEqual(getDifficultyRules('Hard'), { suspects: 5, clues: 9, hints: 3, basePoints: 200 });
});

test('correct accusation combines difficulty base, clue points, and hint penalty', () => {
  assert.deepEqual(calculateScore({ difficulty: 'Medium', correct: true, discoveredClues: 4, hintsUsed: 2 }), {
    base: 150, cluePoints: 20, hintPenalty: 20, total: 150,
  });
});

test('incorrect accusation awards no base points but retains clue points after hint costs', () => {
  assert.deepEqual(calculateScore({ difficulty: 'Hard', correct: false, discoveredClues: 3, hintsUsed: 1 }), {
    base: 0, cluePoints: 15, hintPenalty: 10, total: 5,
  });
});

test('score has a zero floor', () => {
  assert.deepEqual(calculateScore({ difficulty: 'Easy', correct: false, discoveredClues: 0, hintsUsed: 2 }), {
    base: 0, cluePoints: 0, hintPenalty: 20, total: 0,
  });
});
