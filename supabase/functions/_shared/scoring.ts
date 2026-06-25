// Pure scoring / adaptive-Elo helpers. No I/O — kept side-effect free so the
// math can be unit-tested in isolation (see scoring_test.ts) and reused by the
// submit-answer Edge Function.

export const XP_CORRECT = 10;
export const XP_WRONG = 2;
export const K = 32; // Elo update rate

/** Probability the user answers a question of `questionElo` correctly. */
export function expectedScore(ability: number, questionElo: number): number {
  return 1 / (1 + Math.pow(10, (questionElo - ability) / 400));
}

/**
 * One Elo step. The user's ability moves toward/away from the question's elo,
 * and the question's elo moves the opposite way (self-calibrating difficulty).
 */
export function eloUpdate(
  ability: number,
  questionElo: number,
  isCorrect: boolean,
  k: number = K,
): { newAbility: number; newElo: number } {
  const expected = expectedScore(ability, questionElo);
  const actual = isCorrect ? 1 : 0;
  return {
    newAbility: ability + k * (actual - expected),
    newElo: questionElo - k * (actual - expected),
  };
}

/** XP awarded for an answer. */
export function xpFor(isCorrect: boolean): number {
  return isCorrect ? XP_CORRECT : XP_WRONG;
}

/**
 * Next streak value given the last active day. Acting two days in a row
 * increments; a gap resets to 1; acting again the same day is a no-op.
 */
export function nextStreak(
  currentStreak: number,
  lastActiveDate: string | null,
  today: string,
  yesterday: string,
): number {
  if (lastActiveDate === today) return currentStreak; // already counted today
  if (lastActiveDate === yesterday) return currentStreak + 1;
  return 1;
}

/** Stars for a finished level: 3 = perfect, 2 = >=80%, 1 = >=50%, else 0. */
export function starsFor(correct: number, total: number): 0 | 1 | 2 | 3 {
  if (total <= 0) return 0;
  if (correct === total) return 3;
  if (correct >= total * 0.8) return 2;
  if (correct >= total * 0.5) return 1;
  return 0;
}
