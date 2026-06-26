#!/usr/bin/env node
// ============================================================================
// build-seed.mjs — turn reviewed JSON question content into a SQL seed migration.
//
//   node scripts/build-seed.mjs
//
// Reads every  supabase/content/questions/*.json  (each an array of question
// objects), validates them, and writes  supabase/migrations/0003_questions_seed.sql.
//
// Each question is inserted inside its own PL/pgSQL block that looks the level
// up by (track, unit name, level position) — so content never hard-codes ids and
// the build FAILS LOUDLY if a subject/level doesn't exist. Questions are seeded
// with is_active = false; flip to true after QA (see supabase/content/README.md).
//
// Zero dependencies on purpose — there is no Node project at the repo root.
// ============================================================================

import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CONTENT_DIR = join(ROOT, "supabase", "content", "questions");
const OUT_FILE = join(ROOT, "supabase", "migrations", "0003_questions_seed.sql");

const TRACKS = new Set(["daper", "psychometric"]);
const TYPES = new Set(["multiple_choice", "numeric", "open"]);

/** SQL single-quote literal (doubles embedded quotes). */
const q = (s) => `'${String(s).replace(/'/g, "''")}'`;
/** SQL literal that may be null. */
const qOrNull = (s) => (s === undefined || s === null || s === "" ? "null" : q(s));

function fail(file, idx, msg) {
  throw new Error(`${file} [question #${idx + 1}]: ${msg}`);
}

function loadAll() {
  if (!existsSync(CONTENT_DIR)) {
    throw new Error(`No content directory at ${CONTENT_DIR}`);
  }
  const files = readdirSync(CONTENT_DIR)
    .filter((f) => f.endsWith(".json") && !f.startsWith("_"))
    .sort();

  const items = [];
  for (const file of files) {
    const raw = readFileSync(join(CONTENT_DIR, file), "utf8");
    let arr;
    try {
      arr = JSON.parse(raw);
    } catch (e) {
      throw new Error(`${file}: invalid JSON — ${e.message}`);
    }
    if (!Array.isArray(arr)) throw new Error(`${file}: top-level value must be an array`);
    arr.forEach((item, idx) => validate(file, idx, item));
    items.push(...arr.map((item) => ({ ...item, __file: file })));
  }
  return items;
}

function validate(file, idx, item) {
  if (!TRACKS.has(item.track)) fail(file, idx, `track must be one of ${[...TRACKS].join(", ")}`);
  if (typeof item.unit !== "string" || !item.unit.trim()) fail(file, idx, "unit (Hebrew name) is required");
  if (!Number.isInteger(item.level_position) || item.level_position < 1 || item.level_position > 10)
    fail(file, idx, "level_position must be an integer 1–10");
  const type = item.type ?? "multiple_choice";
  if (!TYPES.has(type)) fail(file, idx, `type must be one of ${[...TYPES].join(", ")}`);
  if (!Number.isInteger(item.difficulty) || item.difficulty < 1 || item.difficulty > 5)
    fail(file, idx, "difficulty must be an integer 1–5");
  if (typeof item.body !== "string" || !item.body.trim()) fail(file, idx, "body is required");
  if (typeof item.explanation !== "string" || !item.explanation.trim()) fail(file, idx, "explanation is required");
  if (!Array.isArray(item.options) || item.options.length < 2) fail(file, idx, "options must have at least 2 entries");
  const correct = item.options.filter((o) => o.is_correct === true);
  if (correct.length !== 1) fail(file, idx, `exactly one option must have is_correct=true (found ${correct.length})`);
  item.options.forEach((o, oi) => {
    if (typeof o.body !== "string" || !o.body.trim()) fail(file, idx, `option #${oi + 1} needs a body`);
  });
}

function emit(items) {
  // Stable per-(track,unit,level) question position so ordering is deterministic.
  const posCounter = new Map();
  const blocks = items.map((item) => {
    const key = `${item.track}|${item.unit}|${item.level_position}`;
    const pos = posCounter.get(key) ?? 0;
    posCounter.set(key, pos + 1);
    const type = item.type ?? "multiple_choice";
    const source = item.source ?? "original";

    const optionRows = item.options
      .map((o, i) => {
        const label = o.label ?? String(i + 1);
        const optPos = Number.isInteger(o.position) ? o.position : i;
        return `    (v_q, ${q(label)}, ${q(o.body)}, ${o.is_correct === true}, ${optPos})`;
      })
      .join(",\n");

    return `do $seed$
declare
  v_level bigint;
  v_q     bigint;
begin
  select l.id into v_level
  from levels l
  join units u on u.id = l.unit_id
  where u.track = ${q(item.track)}
    and u.name  = ${q(item.unit)}
    and l.position = ${item.level_position};

  if v_level is null then
    raise exception 'Seed: no level for track=% unit=% position=%',
      ${q(item.track)}, ${q(item.unit)}, ${item.level_position};
  end if;

  insert into questions (track, level_id, type, difficulty, position, body, image_url, explanation, source, is_active)
  values (${q(item.track)}, v_level, ${q(type)}, ${item.difficulty}, ${pos}, ${q(item.body)}, ${qOrNull(item.image_url)}, ${q(item.explanation)}, ${q(source)}, false)
  returning id into v_q;

  insert into answer_options (question_id, label, body, is_correct, position) values
${optionRows};
end
$seed$;`;
  });

  return `-- ============================================================================
-- 0003_questions_seed.sql  —  GENERATED by scripts/build-seed.mjs. Do not edit.
-- Source content: supabase/content/questions/*.json
-- Questions are seeded with is_active = false. Flip to true after QA:
--   update questions set is_active = true where source = 'original';
-- ============================================================================

${blocks.join("\n\n")}
`;
}

function main() {
  const items = loadAll();
  if (items.length === 0) {
    console.error("No questions found in supabase/content/questions/*.json — nothing to generate.");
    process.exit(1);
  }
  writeFileSync(OUT_FILE, emit(items), "utf8");
  console.log(`Wrote ${items.length} question(s) → ${OUT_FILE.replace(ROOT + "/", "")}`);
}

main();
