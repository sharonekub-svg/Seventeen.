# Question bank — coverage status

Target per subject: **10 levels × 5 questions = 50**. Run `node scripts/build-seed.mjs`
to regenerate `supabase/migrations/0003_questions_seed.sql`. All seeded with
`is_active = false`; flip to `true` after QA (`source = 'original'`).

Current total: **590** active-ready questions.

## Complete (50/50) — 11 subjects

| Track | Subject | Source files |
|-------|---------|--------------|
| daper | חשיבה כמותית | `daper-quantitative.json` |
| daper | אנלוגיות מילוליות | `daper-verbal-analogies.json` + `-topoff` |
| daper | הבנת הוראות | `daper-instructions.json` (lv 1–2) + `-gen` (lv 3–10, generated & verified) |
| psychometric | כמותי – אלגברה | `psy-algebra.json` |
| psychometric | כמותי – גיאומטריה | `psy-geometry.json` |
| psychometric | כמותי – גרפים וטבלאות | `psy-data.json` |
| psychometric | מילולי – אנלוגיות | `psy-analogies.json` |
| psychometric | מילולי – היסק ולוגיקה | `psy-logic.json` + `-topoff` |
| psychometric | מילולי – השלמת משפטים | `psy-sentence-completion.json` (lv 1–2) + `-3-10` |
| psychometric | אנגלית – Sentence Completion | `eng-sentence-completion.json` (lv 1–2) + `-3-10` |
| psychometric | אנגלית – Restatement | `eng-restatement.json` (lv 1–2) + `-3-10` |

## Partial (10/50) — 4 subjects, blocked on a non-MCQ flow

These were intentionally **not** auto-expanded because each needs a content type
the current single-question / 4-option schema and the app's question screen do
not yet support well. They have starter levels 1–2 only.

| Subject | What's missing | Why it needs a different flow |
|---------|----------------|------------------------------|
| daper · אנלוגיות צורניות | levels 3–10 | **Figural** — each item is a set of shapes; needs `image_url` diagrams (or an SVG renderer), not text. |
| psychometric · מילולי – הבנת הנקרא | levels 3–10 | **Reading comprehension** — multiple questions share one long passage. Schema stores one question per row; needs a passage/stimulus grouping. |
| psychometric · אנגלית – Reading | levels 3–10 | Same passage-grouping issue as Hebrew reading, in English. |
| psychometric · מטלת כתיבה | levels 3–10 | **Essay** — open writing task graded by rubric, not a multiple-choice answer; needs an open-response + scoring flow. |

### Recommended next steps for the partial subjects
1. **Passage grouping** (covers both reading subjects): add a `passages` table
   (or a `stimulus` column + `stimulus_id`) so several questions reference one
   text. Then a passage + 4–6 questions per level can be authored as JSON.
2. **Figural items**: decide on image hosting (Supabase Storage) or an inline
   SVG convention, set `type` + `image_url`, then author shape-analogy sets.
3. **Writing task**: add an open-response question `type` and a rubric/scoring
   path (likely an Edge Function), separate from the MCQ grader.

Until those land, the 11 complete subjects give a full 10-level ladder each.
