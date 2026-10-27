export const DIFFICULTY_RULES = Object.freeze({
  Easy: Object.freeze({ suspects: 3, clues: 5, hints: 2, basePoints: 100 }),
  Medium: Object.freeze({ suspects: 4, clues: 7, hints: 3, basePoints: 150 }),
  Hard: Object.freeze({ suspects: 5, clues: 9, hints: 3, basePoints: 200 }),
});

export function getDifficultyRules(difficulty) {
  return DIFFICULTY_RULES[difficulty] || null;
}

export function calculateScore({ difficulty, correct, discoveredClues = 0, hintsUsed = 0 }) {
  const rules = getDifficultyRules(difficulty);
  if (!rules) throw new Error('Unknown difficulty.');
  const safeClueCount = Math.max(0, Math.floor(Number(discoveredClues) || 0));
  const safeHintCount = Math.max(0, Math.floor(Number(hintsUsed) || 0));
  const base = correct ? rules.basePoints : 0;
  const cluePoints = safeClueCount * 5;
  const hintPenalty = safeHintCount * 10;
  return { base, cluePoints, hintPenalty, total: Math.max(0, base + cluePoints - hintPenalty) };
}
