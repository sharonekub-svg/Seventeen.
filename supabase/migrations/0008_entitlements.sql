-- ============================================================================
-- 0008_entitlements.sql
-- Monetization scaffold (issue #5): a server-side entitlement flag on the
-- profile plus a helper used to gate premium content. The actual purchase /
-- receipt validation (IAP) flips is_pro / pro_until; that part needs an Apple
-- Developer account and is intentionally out of scope here.
-- ============================================================================
alter table profiles add column if not exists is_pro    boolean not null default false;
alter table profiles add column if not exists pro_until timestamptz;

-- True when the caller has an active entitlement. SECURITY DEFINER so gated
-- queries/functions can call it regardless of the caller's row visibility.
create or replace function has_pro_access(p_user uuid default auth.uid())
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select coalesce(
    (select is_pro or (pro_until is not null and pro_until > now())
     from profiles where id = p_user),
    false);
$$;

revoke all on function has_pro_access(uuid) from public, anon;
grant execute on function has_pro_access(uuid) to authenticated;
