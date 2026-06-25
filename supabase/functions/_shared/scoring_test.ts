// Run with:  deno test supabase/functions/_shared/scoring_test.ts
import {
  assertAlmostEquals,
  assertEquals,
} from "jsr:@std/assert@1";
import {
  eloUpdate,
  expectedScore,
  nextStreak,
  starsFor,
  XP_CORRECT,
  XP_WRONG,
  xpFor,
} from "./scoring.ts";

Deno.test("expectedScore is 0.5 for equal ratings", () => {
  assertAlmostEquals(expectedScore(1000, 1000), 0.5, 1e-9);
});

Deno.test("expectedScore favours the stronger side", () => {
  // Much higher ability than the question -> very likely correct.
  const e = expectedScore(1400, 1000);
  if (!(e > 0.9)) throw new Error(`expected >0.9, got ${e}`);
});

Deno.test("eloUpdate: correct answer raises ability, lowers question elo", () => {
  const { newAbility, newElo } = eloUpdate(1000, 1000, true);
  // expected 0.5, actual 1 -> +K*0.5 = +16
  assertAlmostEquals(newAbility, 1016, 1e-9);
  assertAlmostEquals(newElo, 984, 1e-9);
});

Deno.test("eloUpdate: wrong answer lowers ability, raises question elo", () => {
  const { newAbility, newElo } = eloUpdate(1000, 1000, false);
  assertAlmostEquals(newAbility, 984, 1e-9);
  assertAlmostEquals(newElo, 1016, 1e-9);
});

Deno.test("eloUpdate is zero-sum between ability and question", () => {
  const a0 = 1120, q0 = 980;
  const { newAbility, newElo } = eloUpdate(a0, q0, true);
  assertAlmostEquals(newAbility - a0, q0 - newElo, 1e-9);
});

Deno.test("xpFor returns the right rewards", () => {
  assertEquals(xpFor(true), XP_CORRECT);
  assertEquals(xpFor(false), XP_WRONG);
});

Deno.test("nextStreak: consecutive days increment", () => {
  assertEquals(nextStreak(4, "2026-06-24", "2026-06-25", "2026-06-24"), 5);
});

Deno.test("nextStreak: same day is a no-op", () => {
  assertEquals(nextStreak(4, "2026-06-25", "2026-06-25", "2026-06-24"), 4);
});

Deno.test("nextStreak: a gap resets to 1", () => {
  assertEquals(nextStreak(9, "2026-06-20", "2026-06-25", "2026-06-24"), 1);
});

Deno.test("nextStreak: first ever answer starts at 1", () => {
  assertEquals(nextStreak(0, null, "2026-06-25", "2026-06-24"), 1);
});

Deno.test("starsFor thresholds", () => {
  assertEquals(starsFor(5, 5), 3); // perfect
  assertEquals(starsFor(4, 5), 2); // 80%
  assertEquals(starsFor(3, 5), 1); // 60%
  assertEquals(starsFor(2, 5), 0); // 40%
  assertEquals(starsFor(0, 0), 0); // guard against div-by-zero
});
