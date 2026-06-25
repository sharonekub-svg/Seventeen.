-- ============================================================================
-- 0006_activate_seed_questions.sql
-- QA sign-off for the 0005 starter bank. The 30 authored questions passed the
-- sanity check (exactly 4 options each, exactly one correct, no blank bodies or
-- explanations), so they are activated. This mirrors the authoring pipeline:
-- insert is_active=false (0005) -> review -> flip to true (here).
-- ============================================================================
update questions
set is_active = true
where is_active = false
  and level_id in (16, 31, 46, 20, 35, 50);
