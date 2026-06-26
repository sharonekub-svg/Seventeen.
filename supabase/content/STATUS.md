# Question bank — coverage & exam-fidelity status

Target per subject: **10 levels × 5 questions = 50**. Run `node scripts/build-seed.mjs`
to regenerate `supabase/migrations/0003_questions_seed.sql`. Seeded with
`is_active = false`; migration `0004_activate_seed_questions.sql` flips the
`source = 'original'` rows live.

Current total: **750** questions. **All 15 subjects complete (50/50).**

## Content & sourcing policy

All questions are **original** (written or code-generated here). Nothing is copied
from prep institutes or exam booklets — see the copyright warning in
`supabase/content/README.md`. Real exams are used **only as a format/difficulty
reference**, via NITE's publicly published format pages (Sources below).

## Exam-fidelity decisions (verified against NITE)

- **All multiple-choice questions have exactly 4 options.** ✔
- **Psychometric analogies are pair-to-pair** (`scripts/gen-analogies.mjs`): a stem
  pair, four pair options; correct-by-construction (distractors come from other
  relationship categories).
- **DAPER analogies are fill-in-the-blank** (`א' : ב' כמו ג' : ___`) — the authentic
  format for the psychotechnic / צו-ראשון track.
- **Reading comprehension**: one passage + several questions, passage embedded in
  each question's `body` (`scripts/gen-reading.mjs`).
- **Figural analogies** (`scripts/gen-figural.mjs`): rendered with Unicode
  geometric shapes (○ ● △ ▲ □ ■ …) so they work in the text MCQ flow — no image
  hosting needed. Transformations (count / fill / add / combined) are computed, so
  answers are correct-by-construction. *If you later add image hosting, these can
  be swapped for image-based items.*
- **Writing task** (`psy-writing-3-10.json`): the real מטלת כתיבה is a graded essay,
  which needs an open-response + human/AI-scoring flow the MVP doesn't have. Until
  then, this unit holds **writing-skills MCQs** (thesis selection, paragraph
  structure, argument strength, transitions, fact-vs-opinion, fallacies) — the
  testable skills behind the essay, fitting the current schema. *Replace with a
  real open-response task type when scoring infrastructure exists.*
- **Known minor gap:** sentence-completion items are all single-blank; the real exam
  also uses two-blank items (`word / word` per option) at harder levels.

## Per-subject sources
- daper: `daper-quantitative` · `daper-verbal-analogies` (+`-topoff`) ·
  `daper-instructions` (+`-gen`) · `daper-shape-analogies` (+`daper-figural-3-10`)
- psychometric quantitative: `psy-algebra` · `psy-geometry` · `psy-data`
- psychometric verbal: `psy-analogies` (generated) · `psy-logic` (+`-topoff`) ·
  `psy-sentence-completion` (+`-3-10`) · `psy-reading` (+`-3-10`) ·
  `psy-writing` (+`-3-10`)
- english: `eng-sentence-completion` (+`-3-10`) · `eng-restatement` (+`-3-10`) ·
  `eng-reading` (+`-3-10`)

## Generators (deterministic, re-runnable)
`scripts/gen-instructions.mjs` · `scripts/gen-analogies.mjs` ·
`scripts/gen-figural.mjs` · `scripts/gen-reading.mjs` → then `scripts/build-seed.mjs`.

## Recommended follow-ups (not blocking)
1. Human QA pass before a public launch (content is self-checked, not human-reviewed).
2. Two-blank sentence-completion variant for added realism.
3. Image hosting → swap figural shapes for real diagrams.
4. Open-response question type + rubric scoring → real essay writing task.

## Sources (format reference only — no content copied)
- NITE — Test Format & Components: https://www.nite.org.il/psychometric-entrance-test/format/?lang=en
- NITE — Practice tests: https://www.nite.org.il/practice-tests/?lang=en
- Psychometric Entrance Test (overview): https://en.wikipedia.org/wiki/Psychometric_Entrance_Test
