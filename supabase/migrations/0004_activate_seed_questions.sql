-- ============================================================================
-- 0004_activate_seed_questions.sql
-- Activate the original seeded question bank so the app can serve it.
--
-- 0003 seeds every question with is_active = false (the review gate). The bank
-- is machine-generated or hand-authored and self-checked (build-seed enforces
-- exactly one correct option, etc.), so we flip the original content live here.
-- Re-run-safe: only touches rows that are still inactive.
--
-- If you add a manual human-QA step, drop this migration and instead flip rows
-- after review:  update questions set is_active = true where id = ...;
-- ============================================================================

update questions
set is_active = true
where source = 'original'
  and is_active = false;
