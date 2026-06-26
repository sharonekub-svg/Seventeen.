#!/usr/bin/env node
// ============================================================================
// gen-figural.mjs — generate ORIGINAL figural analogies (אנלוגיות צורניות,
// DAPER) for levels 3-10, using Unicode geometric shapes so they render in the
// existing text/MCQ flow (no image hosting needed).
//
//   node scripts/gen-figural.mjs
//
// Format follows the DAPER fill-in-the-blank analogy: "A : B  כמו  C : ___",
// where the transformation A→B is applied to C. Correct-by-construction: the
// answer is computed from the transformation; distractors are near-miss shapes.
// Deterministic. Writes supabase/content/questions/daper-figural-3-10.json
// (levels 1-2 stay in daper-shape-analogies.json).
// ============================================================================

import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "supabase", "content", "questions", "daper-figural-3-10.json");

let _s = 0x51ed270b;
const rnd = () => { _s |= 0; _s = (_s + 0x6d2b79f5) | 0; let t = Math.imul(_s ^ (_s >>> 15), 1 | _s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const ri = (a, b) => a + Math.floor(rnd() * (b - a + 1));
const pick = (a) => a[Math.floor(rnd() * a.length)];
const shuffle = (a) => { const r = a.slice(); for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; } return r; };

// outline / filled shape pairs
const FILL = [["○", "●"], ["△", "▲"], ["□", "■"], ["◇", "◆"], ["▽", "▼"], ["☆", "★"]];
const OUTLINE = FILL.map((p) => p[0]);

function mc(body, explanation, difficulty, correct, wrongs) {
  const seen = new Set([correct]);
  const d = [];
  for (const w of wrongs) { if (!seen.has(w)) { seen.add(w); d.push(w); } if (d.length === 3) break; }
  if (d.length < 3) return null;
  const opts = shuffle([{ v: correct, c: true }, ...d.map((v) => ({ v, c: false }))]);
  return { track: "daper", unit: "אנלוגיות צורניות", level_position: 0, difficulty,
    body, explanation, source: "original",
    options: opts.map((o, i) => ({ label: String(i + 1), body: o.v, is_correct: o.c, position: i })) };
}

// T1: quantity — repeat a shape k times
function tCount(diff) {
  const s1 = pick(OUTLINE); let s2 = pick(OUTLINE); while (s2 === s1) s2 = pick(OUTLINE);
  const k = ri(2, diff >= 4 ? 4 : 3);
  const body = `${s1} : ${s1.repeat(k)}  —  כמו  ${s2} : ___`;
  const expl = `הקשר: שכפול הצורה ${k} פעמים. כשם ש-${s1} הופך ל-${s1.repeat(k)}, כך ${s2} הופך ל-${s2.repeat(k)}.`;
  return mc(body, expl, diff, s2.repeat(k), [s2.repeat(k + 1), s2.repeat(Math.max(1, k - 1)), s1.repeat(k)]);
}

// T2: fill — outline becomes filled
function tFill(diff) {
  const [o1, f1] = pick(FILL); let pair2 = pick(FILL); while (pair2[0] === o1) pair2 = pick(FILL);
  const [o2, f2] = pair2;
  const body = `${o1} : ${f1}  —  כמו  ${o2} : ___`;
  const expl = `הקשר: מילוי הצורה (מתאר → מלא). כשם ש-${o1} הופך ל-${f1}, כך ${o2} הופך ל-${f2}.`;
  return mc(body, expl, diff, f2, [o2, f1, pick(OUTLINE.filter((s) => s !== o2))]);
}

// T3: add a second, fixed shape
function tAdd(diff) {
  const s1 = pick(OUTLINE); let s2 = pick(OUTLINE); while (s2 === s1) s2 = pick(OUTLINE);
  let add = pick(OUTLINE); while (add === s1 || add === s2) add = pick(OUTLINE);
  const body = `${s1} : ${s1}${add}  —  כמו  ${s2} : ___`;
  const expl = `הקשר: הוספת הצורה ${add} מימין. כשם ש-${s1} הופך ל-${s1}${add}, כך ${s2} הופך ל-${s2}${add}.`;
  return mc(body, expl, diff, `${s2}${add}`, [`${add}${s2}`, `${s2}${s2}`, `${s2}${add}${add}`]);
}

// T4: combine count + fill (harder)
function tCountFill(diff) {
  const [o1, f1] = pick(FILL); let pair2 = pick(FILL); while (pair2[0] === o1) pair2 = pick(FILL);
  const [o2, f2] = pair2; const k = ri(2, 3);
  const body = `${o1} : ${f1.repeat(k)}  —  כמו  ${o2} : ___`;
  const expl = `הקשר: מילוי הצורה ושכפולה ${k} פעמים. כשם ש-${o1} הופך ל-${f1.repeat(k)}, כך ${o2} הופך ל-${f2.repeat(k)}.`;
  return mc(body, expl, diff, f2.repeat(k), [o2.repeat(k), f2.repeat(k + 1), f1.repeat(k)]);
}

const TPL = { low: [tCount, tFill, tAdd], high: [tFill, tAdd, tCountFill, tCount] };
const diffFor = (lv) => lv <= 4 ? 2 : lv <= 6 ? 3 : lv <= 8 ? 4 : 5;

const out = [];
for (let lv = 3; lv <= 10; lv++) {
  const diff = diffFor(lv);
  const pool = lv >= 7 ? TPL.high : TPL.low;
  let made = 0, guard = 0; const seen = new Set();
  while (made < 5 && guard < 300) {
    guard++;
    const item = pick(pool)(diff);
    if (!item) continue;
    if (seen.has(item.body)) continue;
    seen.add(item.body);
    item.level_position = lv;
    out.push(item); made++;
  }
}
writeFileSync(OUT, JSON.stringify(out, null, 2) + "\n", "utf8");
console.log(`Wrote ${out.length} figural analogy question(s) → ${OUT.replace(ROOT + "/", "")}`);
