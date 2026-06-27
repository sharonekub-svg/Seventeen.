-- ============================================================================
-- 0005_friend_suggestions.sql  —  "People you may know" suggestions.
--
-- Suggests profiles the caller is NOT already connected to (no friendship row
-- in either direction, any status, and not themselves), ranked by number of
-- mutual friends and then by XP. With no friends yet this gracefully falls back
-- to the most active users, so the list is never empty.
--
-- security definer so it can read across `friendships` (which is otherwise only
-- visible to the two parties) to compute mutuals.
-- ============================================================================
create or replace function friend_suggestions(p_limit int default 10)
returns table (
  id           uuid,
  username     text,
  display_name text,
  total_xp     int,
  mutual       int
)
language sql
stable
security definer
set search_path = public
as $$
  with me as (select auth.uid() as uid),
  -- my accepted friends
  my_friends as (
    select addressee as fid from friendships
      where requester = (select uid from me) and status = 'accepted'
    union
    select requester as fid from friendships
      where addressee = (select uid from me) and status = 'accepted'
  ),
  -- everyone I already have any relationship with (any status) + myself
  connected as (
    select addressee as uid from friendships where requester = (select uid from me)
    union
    select requester as uid from friendships where addressee = (select uid from me)
    union
    select (select uid from me)
  )
  select
    p.id,
    p.username,
    p.display_name,
    p.total_xp,
    (
      select count(*) from my_friends mf
      where exists (
        select 1 from friendships f
        where f.status = 'accepted'
          and (
            (f.requester = mf.fid and f.addressee = p.id) or
            (f.requester = p.id   and f.addressee = mf.fid)
          )
      )
    )::int as mutual
  from profiles p
  where p.id not in (select uid from connected)
  order by mutual desc, p.total_xp desc, p.created_at asc
  limit greatest(1, least(p_limit, 50));
$$;

grant execute on function friend_suggestions(int) to authenticated;
