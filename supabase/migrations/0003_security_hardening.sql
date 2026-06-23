-- Security hardening for SECURITY DEFINER functions.
-- Internal trigger/cron functions must not be reachable via the public REST API,
-- and user-facing RPCs are restricted to signed-in (authenticated) users only.
-- Mirrors the state applied on the live project.

-- Trigger-only / cron-only functions: not callable via the API at all.
revoke all on function public.handle_new_user() from public, anon, authenticated;
revoke all on function public.process_streaks() from public, anon, authenticated;

-- User-facing RPCs: authenticated users only, never anonymous.
revoke all on function public.next_adaptive_question(uuid, bigint) from public, anon;
grant execute on function public.next_adaptive_question(uuid, bigint) to authenticated;

revoke all on function public.global_leaderboard(integer) from public, anon;
grant execute on function public.global_leaderboard(integer) to authenticated;

revoke all on function public.friends_leaderboard() from public, anon;
grant execute on function public.friends_leaderboard() to authenticated;

-- Pin a stable search_path on the adaptive selector (close the mutable-path vector).
alter function public.next_adaptive_question(uuid, bigint) set search_path = public;
