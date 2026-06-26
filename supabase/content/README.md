# Question content pipeline

This folder is how questions get into the app. The database ships with the 15
subjects and their levels, but **no questions** — you add them here, then run one
command to turn them into a SQL migration.

## ⚠️ Copyright policy (read first)

Do **not** insert questions copied (or lightly paraphrased) from Kidum, Yaalon,
מכון נועם, official booklets, etc. Use such material **only as a style/difficulty
reference** to write **original** questions. Anything that ships in the app must be
original or something you are licensed to use. See `EXAMPLES.md` for how to collect
reference samples safely.

## Flow

```
supabase/content/questions/*.json     ← you (or Claude) author original questions here
        │  node scripts/build-seed.mjs
        ▼
supabase/migrations/0003_questions_seed.sql   ← generated, is_active = false
        │  supabase db push   (or db reset locally)
        ▼
review in DB → flip live:  update questions set is_active = true where source = 'original';
```

## JSON format

One file per subject under `questions/` (filename is free-form; files starting with
`_` are ignored). Each file is an **array** of question objects:

```json
[
  {
    "track": "psychometric",          // "daper" | "psychometric"
    "unit": "כמותי – אלגברה",          // EXACT subject name (see list below)
    "level_position": 1,               // 1–10 (which level inside the subject)
    "type": "multiple_choice",         // default; "numeric" | "open" also valid
    "difficulty": 2,                   // 1 (easy) – 5 (hard)
    "body": "גוף השאלה בעברית",
    "image_url": null,                 // optional diagram URL
    "explanation": "הסבר מלא לתשובה הנכונה",
    "source": "original",              // free text; keep 'original' for generated content
    "options": [
      { "label": "1", "body": "אפשרות א", "is_correct": false, "position": 0 },
      { "label": "2", "body": "אפשרות ב", "is_correct": true,  "position": 1 },
      { "label": "3", "body": "אפשרות ג", "is_correct": false, "position": 2 },
      { "label": "4", "body": "אפשרות ד", "is_correct": false, "position": 3 }
    ]
  }
]
```

Rules the generator enforces (it fails loudly otherwise):
- `track` is `daper` or `psychometric`; `unit` must match a real subject name exactly.
- `level_position` is 1–10, `difficulty` is 1–5.
- `body` and `explanation` are non-empty.
- `options` has ≥2 entries and **exactly one** `is_correct: true`.

`sample-quantitative.json` is a working example you can copy and then delete.

## The 15 subjects (use these exact `unit` names)

**DAPER** (`"track": "daper"`): `חשיבה כמותית` · `אנלוגיות מילוליות` ·
`אנלוגיות צורניות` · `הבנת הוראות`

**Psychometric** (`"track": "psychometric"`): `כמותי – אלגברה` · `כמותי – גיאומטריה` ·
`כמותי – גרפים וטבלאות` · `מילולי – אנלוגיות` · `מילולי – היסק ולוגיקה` ·
`מילולי – השלמת משפטים` · `מילולי – הבנת הנקרא` · `אנגלית – Sentence Completion` ·
`אנגלית – Restatement` · `אנגלית – Reading` · `מטלת כתיבה`

> The `–` is an en-dash (not a hyphen). Copy the names from here to avoid mismatches.

## Build

```
node scripts/build-seed.mjs
```

Writes `supabase/migrations/0003_questions_seed.sql`. Re-run any time content changes.
