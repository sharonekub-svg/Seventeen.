-- ============================================================================
-- 0003_harden_permissions.sql
-- Consolidated security hardening:
--   (a) column-level hiding of answer_options.is_correct from clients
--   (b) function execute grants (trigger/cron functions locked down,
--       user-facing RPCs limited to authenticated), stable search_path.
-- All statements are idempotent and safe to re-run.
-- ============================================================================

-- (a) Never expose the correct answer to a client. Revoke table-wide SELECT and
-- re-grant only the safe columns. The submit-answer / daily-question Edge
-- Functions read is_correct through the service role, which bypasses these
-- grants, so server-side scoring is unaffected.
revoke select on public.answer_options from anon, authenticated;
grant  select (id, question_id, label, body, position)
  on public.answer_options to anon, authenticated;

-- (b) Trigger-/cron-only functions: not callable via the public API at all.
revoke all on function public.handle_new_user()  from public, anon, authenticated;
revoke all on function public.process_streaks()  from public, anon, authenticated;

-- User-facing RPCs: signed-in users only, never anonymous.
revoke all on function public.next_adaptive_question(uuid, bigint) from public, anon;
grant  execute on function public.next_adaptive_question(uuid, bigint) to authenticated;

revoke all on function public.global_leaderboard(integer) from public, anon;
grant  execute on function public.global_leaderboard(integer) to authenticated;

revoke all on function public.friends_leaderboard() from public, anon;
grant  execute on function public.friends_leaderboard() to authenticated;

-- Pin a stable search_path on the adaptive selector (close the mutable-path vector).
alter function public.next_adaptive_question(uuid, bigint) set search_path = public;
