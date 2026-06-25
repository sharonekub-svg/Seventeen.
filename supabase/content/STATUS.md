# Question bank — coverage & exam-fidelity status

Target per subject: **10 levels × 5 questions = 50**. Run `node scripts/build-seed.mjs`
to regenerate `supabase/migrations/0003_questions_seed.sql`. All seeded with
`is_active = false`; flip to `true` after QA (`source = 'original'`).

Current total: **670** active-ready questions. **13 of 15 subjects complete.**

## Content & sourcing policy

All questions are **original** (written or code-generated here). Nothing is copied
from prep institutes or exam booklets — see the copyright warning in
`supabase/content/README.md`. Real exams are used **only as a format/difficulty
reference**, via NITE's publicly published format pages (see Sources below).

## Exam-fidelity decisions (verified against NITE)

- **All multiple-choice questions have exactly 4 options.** ✔ matches NITE.
- **Psychometric analogies are pair-to-pair.** A stem word-pair is given and each
  of the 4 options is itself a *pair*; you choose the pair with the same
  relationship (official example: `ספר : ספרייה` → `תמונה : גלריה`). Implemented in
  `scripts/gen-analogies.mjs` (correct-by-construction: distractor pairs come from
  other relationship categories, so exactly one option matches).
- **DAPER (psychotechnic / צו-ראשון) analogies are fill-in-the-blank**
  (`א' : ב' כמו ג' : ___`). That is the authentic format for *that* track, so the
  DAPER analogy unit is intentionally left in this form.
- **Reading comprehension** = one passage + several questions; the passage is
  embedded in each question's `body` (no schema change needed).
- **Known remaining fidelity gap:** Hebrew/English *sentence completion* on the real
  exam often has **two blanks** (each option supplies two words separated by `/`).
  The current sentence-completion items are all single-blank — valid, but a
  two-blank variant at the harder levels would raise realism. Not yet done.

## Complete (50/50) — 13 subjects

daper: חשיבה כמותית · אנלוגיות מילוליות · הבנת הוראות
psychometric: כמותי – אלגברה · כמותי – גיאומטריה · כמותי – גרפים וטבלאות ·
מילולי – אנלוגיות · מילולי – היסק ולוגיקה · מילולי – השלמת משפטים ·
מילולי – הבנת הנקרא · אנגלית – Sentence Completion · אנגלית – Restatement ·
אנגלית – Reading

## Partial (10/50) — 2 subjects, blocked on a non-MCQ flow

| Subject | Why it needs infrastructure first |
|---------|-----------------------------------|
| daper · אנלוגיות צורניות | **Figural** — each item is a set of shapes; needs `image_url` diagrams (Supabase Storage) or an inline-SVG convention, not text. |
| psychometric · מטלת כתיבה | **Essay** — an open writing task graded by rubric, not a 4-option answer; needs an open-response question type + a scoring path (likely an Edge Function), separate from the MCQ grader. |

### Recommended next steps
1. **Two-blank sentence completion** for higher levels (realism; no schema change).
2. **Figural items**: choose image hosting, set `type` + `image_url`, author shape sets.
3. **Writing task**: add an open-response `type` + rubric scoring (Edge Function).

## Sources (format reference only — no content copied)
- NITE — Test Format & Components: https://www.nite.org.il/psychometric-entrance-test/format/?lang=en
- NITE — Practice tests: https://www.nite.org.il/practice-tests/?lang=en
- Psychometric Entrance Test (overview): https://en.wikipedia.org/wiki/Psychometric_Entrance_Test
