#!/usr/bin/env node
// ============================================================================
// gen-instructions.mjs — generate ORIGINAL "הבנת הוראות" (DAPER instructions)
// questions with machine-VERIFIED correct answers, for levels 3–10.
//
//   node scripts/gen-instructions.mjs
//
// Writes supabase/content/questions/daper-instructions-gen.json (an array the
// build-seed pipeline picks up like any other content file). Every answer is
// computed in code and the correct option is checked to exist exactly once, so
// these are guaranteed self-consistent. Deterministic (fixed seed) so re-runs
// are stable. Levels 1–2 stay hand-authored in daper-instructions.json.
// ============================================================================

import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "supabase", "content", "questions", "daper-instructions-gen.json");

// --- tiny deterministic PRNG (mulberry32) so output is reproducible ----------
let _s = 0x9e3779b9;
const rnd = () => {
  _s |= 0; _s = (_s + 0x6d2b79f5) | 0;
  let t = Math.imul(_s ^ (_s >>> 15), 1 | _s);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const ri = (a, b) => a + Math.floor(rnd() * (b - a + 1)); // inclusive
const pick = (arr) => arr[Math.floor(rnd() * arr.length)];
const shuffle = (arr) => {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const DAYS = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];
const MONTHS = ["ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני", "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר"];
const HEB_LETTERS = ["א", "ב", "ג", "ד", "ה", "ו", "ז", "ח", "ט", "י"];

// Build a question object from a correct value + a set of wrong values.
// Wrongs are de-duplicated and never equal the answer; options are shuffled and
// re-labelled 1..4 by final position. Returns null if we can't form 4 options.
function mc(body, explanation, difficulty, correct, wrongs) {
  const seen = new Set([String(correct)]);
  const distractors = [];
  for (const w of wrongs) {
    const s = String(w);
    if (!seen.has(s)) { seen.add(s); distractors.push(s); }
    if (distractors.length === 3) break;
  }
  if (distractors.length < 3) return null;
  const options = shuffle([{ v: String(correct), c: true }, ...distractors.map((d) => ({ v: d, c: false }))]);
  return {
    track: "daper",
    unit: "הבנת הוראות",
    level_position: 0, // filled by caller
    difficulty,
    body,
    explanation,
    source: "original",
    options: options.map((o, i) => ({ label: String(i + 1), body: o.v, is_correct: o.c, position: i })),
  };
}

// ---- templates: each returns a question (correct answer computed here) -------

function tSortPick(diff) {
  const n = ri(4, diff >= 4 ? 6 : 5);
  const nums = [];
  while (nums.length < n) { const x = ri(2, 99); if (!nums.includes(x)) nums.push(x); }
  const asc = rnd() < 0.5;
  const sorted = nums.slice().sort((a, b) => (asc ? a - b : b - a));
  const k = ri(1, n);
  const ord = { 1: "הראשון", 2: "השני", 3: "השלישי", 4: "הרביעי", 5: "החמישי", 6: "השישי" }[k];
  const ans = sorted[k - 1];
  const body = `סדרו את המספרים ${nums.join(", ")} בסדר ${asc ? "עולה" : "יורד"}, ובחרו את המספר ${ord} ברצף שהתקבל.`;
  const expl = `בסדר ${asc ? "עולה" : "יורד"}: ${sorted.join(", ")}. המספר ${ord} הוא ${ans}.`;
  return mc(body, expl, diff, ans, [sorted[k] ?? sorted[0], sorted[k - 2] ?? sorted[n - 1], nums[k - 1]]);
}

function tDay(diff) {
  const start = ri(0, 6);
  const add = ri(2, diff >= 4 ? 20 : 9);
  const ans = DAYS[(start + add) % 7];
  const body = `אם היום יום ${DAYS[start]}, איזה יום יהיה בעוד ${add} ימים?`;
  const expl = `${DAYS[start]} ועוד ${add} ימים (${add} mod 7 = ${add % 7}) נופל על יום ${ans}.`;
  return mc(body, expl, diff, ans, [DAYS[(start + add + 1) % 7], DAYS[(start + add - 1 + 7) % 7], DAYS[(start + add + 2) % 7]]);
}

function tMonth(diff) {
  const start = ri(0, 11);
  const add = ri(2, diff >= 4 ? 15 : 8);
  const ans = MONTHS[(start + add) % 12];
  const body = `החודש הוא ${MONTHS[start]}. איזה חודש יהיה בעוד ${add} חודשים?`;
  const expl = `${MONTHS[start]} ועוד ${add} חודשים (${add} mod 12 = ${add % 12}) הוא ${ans}.`;
  return mc(body, expl, diff, ans, [MONTHS[(start + add + 1) % 12], MONTHS[(start + add - 1 + 12) % 12], MONTHS[(start + add + 2) % 12]]);
}

function tChain(diff) {
  let x = ri(2, diff >= 4 ? 30 : 12);
  const steps = [];
  const start = x;
  const nOps = diff >= 4 ? 3 : 2;
  for (let i = 0; i < nOps; i++) {
    const op = pick(["add", "sub", "mul"]);
    if (op === "add") { const k = ri(2, 12); x += k; steps.push(`הוסיפו ${k}`); }
    else if (op === "sub") { const k = ri(1, Math.min(9, x - 1)); x -= k; steps.push(`החסירו ${k}`); }
    else { const k = ri(2, 3); x *= k; steps.push(`הכפילו ב-${k}`); }
  }
  const body = `קחו את המספר ${start}, ${steps.join(", ")}. מהי התוצאה הסופית?`;
  const expl = `${start} → ${steps.join(" → ")} = ${x}.`;
  return mc(body, expl, diff, x, [x + 1, x - 1, x + ri(2, 5)]);
}

function tCount(diff) {
  const n = ri(5, diff >= 4 ? 9 : 7);
  const nums = [];
  for (let i = 0; i < n; i++) nums.push(ri(1, 20));
  const thr = ri(8, 14);
  const above = rnd() < 0.5;
  const ans = nums.filter((v) => (above ? v > thr : v < thr)).length;
  const body = `נתונה הרשימה: ${nums.join(", ")}. כמה מספרים ברשימה ${above ? "גדולים מ" : "קטנים מ"}-${thr}?`;
  const expl = `המספרים ש${above ? "גדולים" : "קטנים"} מ-${thr}: ${nums.filter((v) => (above ? v > thr : v < thr)).join(", ") || "אין"}. סך הכול ${ans}.`;
  return mc(body, expl, diff, ans, [ans + 1, ans - 1, ans + 2]);
}

function tClock(diff) {
  const h = ri(6, 20);
  const addH = ri(2, diff >= 4 ? 9 : 5);
  const half = diff >= 4 && rnd() < 0.5;
  const startM = half ? 30 : 0;
  let total = h * 60 + startM + addH * 60 + (half ? 30 : 0);
  total %= 24 * 60;
  const eh = Math.floor(total / 60), em = total % 60;
  const fmt = (H, M) => `${String(H).padStart(2, "0")}:${String(M).padStart(2, "0")}`;
  const ans = fmt(eh, em);
  const body = `השעה כעת ${fmt(h, startM)}. מה תהיה השעה בעוד ${addH}${half ? " וחצי" : ""} שעות?`;
  const expl = `${fmt(h, startM)} ועוד ${addH}${half ? ":30" : ":00"} שעות = ${ans}.`;
  return mc(body, expl, diff, ans, [fmt((eh + 1) % 24, em), fmt((eh + 23) % 24, em), fmt(eh, (em + 30) % 60)]);
}

function tLetter(diff) {
  const n = ri(4, 5);
  const idxs = shuffle(HEB_LETTERS.map((_, i) => i)).slice(0, n).sort((a, b) => a - b);
  const letters = shuffle(idxs.map((i) => HEB_LETTERS[i]));
  const k = ri(1, n);
  const ord = { 1: "הראשונה", 2: "השנייה", 3: "השלישית", 4: "הרביעית", 5: "החמישית" }[k];
  const sorted = letters.slice().sort((a, b) => HEB_LETTERS.indexOf(a) - HEB_LETTERS.indexOf(b));
  const ans = sorted[k - 1];
  const body = `סדרו את האותיות ${letters.join(", ")} לפי סדר האלף-בית, ובחרו את האות ${ord}.`;
  const expl = `לפי הא"ב: ${sorted.join(", ")}. האות ${ord} היא ${ans}.`;
  return mc(body, expl, diff, ans, [sorted[k] ?? sorted[0], sorted[k - 2] ?? sorted[n - 1], HEB_LETTERS[(HEB_LETTERS.indexOf(ans) + 1) % HEB_LETTERS.length]]);
}

function tConditional(diff) {
  let a = ri(3, 30), b = ri(3, 30);
  if (a === b) b = a + 1; // keep the comparison decisive
  const cond = a > b; // the question text always asks "a > b"
  const thenV = ri(10, 50), elseV = ri(10, 50);
  const ans = cond ? thenV : elseV;
  const body = `אם ${a} גדול מ-${b}, ענו ${thenV}; אחרת ענו ${elseV}.`;
  const expl = `${a} ${cond ? "גדול" : "אינו גדול"} מ-${b}, ולכן יש לבחור באפשרות ${cond ? "הראשונה" : "השנייה"}: ${ans}.`;
  return mc(body, expl, diff, ans, [cond ? elseV : thenV, ans + ri(1, 4), ans - ri(1, 4)]);
}

const TEMPLATES = [tSortPick, tDay, tMonth, tChain, tCount, tClock, tLetter, tConditional];

function difficultyForLevel(lv) {
  if (lv <= 4) return 2;
  if (lv <= 6) return 3;
  if (lv <= 8) return 4;
  return 5;
}

const out = [];
for (let lv = 3; lv <= 10; lv++) {
  const diff = difficultyForLevel(lv);
  // 5 questions per level, drawn from a rotating mix so no level repeats one template too often.
  const order = shuffle(TEMPLATES);
  let made = 0, guard = 0;
  while (made < 5 && guard < 200) {
    guard++;
    const t = order[(made + guard) % order.length];
    const qd = Math.min(5, Math.max(2, diff + ri(-1, 0))); // slight per-question variance, floored at 2
    const item = t(qd);
    if (!item) continue;
    item.level_position = lv;
    out.push(item);
    made++;
  }
}

writeFileSync(OUT, JSON.stringify(out, null, 2) + "\n", "utf8");
console.log(`Wrote ${out.length} instruction question(s) → ${OUT.replace(ROOT + "/", "")}`);
