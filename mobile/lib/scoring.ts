// Client-side scoring helpers. Mirrors the thresholds documented for the
// backend so the level-complete UI awards stars consistently.

/** Stars for a finished level: 3 = perfect, 2 = >=80%, 1 = >=50%, else 0. */
export function starsFor(correct: number, total: number): 0 | 1 | 2 | 3 {
  if (total <= 0) return 0;
  if (correct === total) return 3;
  if (correct >= total * 0.8) return 2;
  if (correct >= total * 0.5) return 1;
  return 0;
}
