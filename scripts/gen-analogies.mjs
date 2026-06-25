#!/usr/bin/env node
// ============================================================================
// gen-analogies.mjs — generate ORIGINAL psychometric verbal analogies in the
// REAL NITE format: a stem word-pair, and four answer options that are each a
// PAIR; the test-taker picks the pair whose relationship matches the stem.
//
//   node scripts/gen-analogies.mjs
//
// Correct-by-construction: the stem pair and the correct option are two pairs
// drawn from the SAME relationship category; the three distractors are pairs
// drawn from DIFFERENT categories, so exactly one option shares the stem's
// relationship. Deterministic (fixed seed). Overwrites psy-analogies.json with
// 50 items (levels 1-10, 5 each), difficulty rising with level.
//
// Source/format reference: NITE official test-format pages (verbal analogies
// are pair-to-pair, 4 options). Content is original — only the abstract word
// relationships are used, never copied questions.
// ============================================================================

import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "supabase", "content", "questions", "psy-analogies.json");

// deterministic PRNG (mulberry32)
let _s = 0x1234abcd;
const rnd = () => { _s |= 0; _s = (_s + 0x6d2b79f5) | 0; let t = Math.imul(_s ^ (_s >>> 15), 1 | _s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const ri = (a, b) => a + Math.floor(rnd() * (b - a + 1));
const shuffle = (arr) => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

// Relationship categories. tier 1 = concrete/easy, 2 = mid, 3 = abstract/hard.
// Each pair [a,b] is read "a : b" and exhibits `desc`.
const CATS = [
  { tier: 1, desc: "פריט לבוש והאיבר שעליו לובשים אותו", pairs: [["כפפה", "יד"], ["נעל", "רגל"], ["כובע", "ראש"], ["גרב", "כף רגל"], ["צעיף", "צוואר"]] },
  { tier: 1, desc: "בעל חיים והתוצר שהוא מספק לאדם", pairs: [["פרה", "חלב"], ["תרנגולת", "ביצה"], ["כבשה", "צמר"], ["דבורה", "דבש"], ["תולעת משי", "משי"]] },
  { tier: 1, desc: "כלי עבודה ובעל המקצוע המשתמש בו", pairs: [["מכחול", "צייר"], ["פטיש", "נגר"], ["אזמל", "מנתח"], ["מספריים", "ספר"], ["מצלמה", "צלם"]] },
  { tier: 1, desc: "חלק והשלם שאליו הוא שייך", pairs: [["גלגל", "מכונית"], ["דף", "ספר"], ["ענף", "עץ"], ["חדר", "בית"], ["מקש", "מקלדת"]] },
  { tier: 2, desc: "תופעה ועוצמתה הקיצונית", pairs: [["גשם", "מבול"], ["רוח", "סופה"], ["חום", "להט"], ["עצב", "ייאוש"], ["כעס", "זעם"]] },
  { tier: 2, desc: "פרט והקבוצה הכללית שאליה הוא משתייך", pairs: [["ורד", "פרח"], ["כינור", "כלי נגינה"], ["נמר", "חיה"], ["יהלום", "אבן חן"], ["אורן", "עץ"]] },
  { tier: 2, desc: "מקום והפעולה האופיינית המתבצעת בו", pairs: [["מסעדה", "אכילה"], ["ספרייה", "קריאה"], ["בריכה", "שחייה"], ["תיאטרון", "הצגה"], ["כיתה", "לימוד"]] },
  { tier: 2, desc: "כלי והחומר שהוא מכיל", pairs: [["כוס", "מים"], ["ארנק", "כסף"], ["מצבר", "חשמל"], ["מאגר", "מידע"], ["מחסן", "סחורה"]] },
  { tier: 3, desc: "מילים בעלות משמעות הפוכה (ניגוד)", pairs: [["אור", "חושך"], ["שמחה", "עצב"], ["מלא", "ריק"], ["עשיר", "עני"], ["חכם", "טיפש"]] },
  { tier: 3, desc: "תכונה והמידה הקיצונית שלה (הגזמה)", pairs: [["חסכן", "קמצן"], ["בטוח", "יהיר"], ["זהיר", "חששן"], ["אמיץ", "פזיז"], ["גמיש", "חסר עמוד שדרה"]] },
  { tier: 3, desc: "פעולה והתוצאה הנובעת ממנה", pairs: [["זריעה", "יבול"], ["לימוד", "ידע"], ["אימון", "כושר"], ["חימום", "המסה"], ["השקיה", "צמיחה"]] },
  { tier: 3, desc: "מומחה ותחום העיסוק שלו", pairs: [["אסטרונום", "כוכבים"], ["היסטוריון", "עבר"], ["בוטנאי", "צמחים"], ["גאולוג", "סלעים"], ["קרדיולוג", "לב"]] },
];

const fmt = (p) => `${p[0]} : ${p[1]}`;
const pairKey = (p) => p.join("|");

function makeItem(level, diff, allowedTiers) {
  const cats = CATS.filter((c) => allowedTiers.includes(c.tier));
  const cat = cats[Math.floor(rnd() * cats.length)];
  const two = shuffle(cat.pairs).slice(0, 2);
  const stem = two[0], correct = two[1];
  // distractors: one pair from each of three DIFFERENT categories
  const otherCats = shuffle(CATS.filter((c) => c.desc !== cat.desc)).slice(0, 3);
  const distractors = otherCats.map((c) => c.pairs[Math.floor(rnd() * c.pairs.length)]);
  const used = new Set([pairKey(stem), pairKey(correct), ...distractors.map(pairKey)]);
  if (used.size !== 5) return null; // collision; caller retries
  const opts = shuffle([{ p: correct, c: true }, ...distractors.map((p) => ({ p, c: false }))]);
  return {
    track: "psychometric",
    unit: "מילולי – אנלוגיות",
    level_position: level,
    difficulty: diff,
    body: `${fmt(stem)}\n\nבחרו את זוג המילים שהקשר ביניהן דומה לקשר שבזוג שלמעלה.`,
    explanation: `הקשר בין שתי המילים שבשאלה: ${cat.desc}. הזוג "${fmt(correct)}" מבטא בדיוק את אותו קשר, ולכן זו התשובה הנכונה.`,
    source: "original",
    options: opts.map((o, i) => ({ label: String(i + 1), body: fmt(o.p), is_correct: o.c, position: i })),
  };
}

function tiersForLevel(lv) {
  if (lv <= 2) return [1];
  if (lv <= 4) return [1, 2];
  if (lv <= 6) return [2];
  if (lv <= 8) return [2, 3];
  return [3];
}
function diffForLevel(lv) { return lv <= 2 ? 2 : lv <= 4 ? 3 : lv <= 8 ? 4 : 5; }

const out = [];
for (let lv = 1; lv <= 10; lv++) {
  const tiers = tiersForLevel(lv), diff = diffForLevel(lv);
  const seenStems = new Set();
  let made = 0, guard = 0;
  while (made < 5 && guard < 500) {
    guard++;
    const it = makeItem(lv, diff, tiers);
    if (!it) continue;
    const stemKey = it.body.split("\n")[0];
    if (seenStems.has(stemKey)) continue; // no repeated stem within a level
    seenStems.add(stemKey);
    out.push(it);
    made++;
  }
}

writeFileSync(OUT, JSON.stringify(out, null, 2) + "\n", "utf8");
console.log(`Wrote ${out.length} pair-to-pair analogy question(s) → ${OUT.replace(ROOT + "/", "")}`);
