-- ============================================================================
-- 0004_cron_secret_store.sql
-- Self-contained shared secret for cron-triggered Edge Functions.
-- Replaces the manual `supabase secrets set CRON_SECRET=...` step so the
-- nightly push is provisioned reproducibly (issue #7). The secret lives in a
-- service-role-only table: RLS is enabled with NO policy and grants are
-- revoked, so anon/authenticated clients can never read it; pg_cron (runs as
-- the scheduling superuser) and Edge Functions (service role) can.
--
-- Note: the "RLS enabled, no policy" linter notice on this table is intentional
-- — a missing policy is exactly what blocks every client role.
-- ============================================================================
create table if not exists public.app_config (
  key   text primary key,
  value text not null
);

alter table public.app_config enable row level security;  -- no policy => clients blocked
revoke all on public.app_config from anon, authenticated;

-- Generate the cron secret once. Re-running the migration keeps the existing value.
insert into public.app_config (key, value)
values ('cron_secret', encode(gen_random_bytes(16), 'hex'))
on conflict (key) do nothing;
