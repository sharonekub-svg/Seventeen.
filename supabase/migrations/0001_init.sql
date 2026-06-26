-- ============================================================================
-- 0001_init.sql  —  Core schema for the aptitude micro-learning app
-- Covers: profiles, learning path (units/levels), question bank,
--         answers & progress, adaptive ability, streaks + freezes,
--         friends, and leaderboards. Row Level Security on everything.
-- ============================================================================

-- ---------- Enums ----------
create type exam_track    as enum ('daper', 'psychometric');
create type question_type as enum ('multiple_choice', 'numeric', 'open');
create type level_status   as enum ('locked', 'unlocked', 'completed');
create type friend_status  as enum ('pending', 'accepted');

-- ============================================================================
-- Profiles
--   Public-readable gamification fields live here (needed for leaderboards).
--   Sensitive fields (push token) live in profiles_private with strict RLS.
-- ============================================================================
create table profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  username        text unique not null,
  display_name    text not null,
  active_track    exam_track not null default 'psychometric',
  current_streak  int  not null default 0,
  longest_streak  int  not null default 0,
  last_active_date date,
  streak_freezes  int  not null default 2,    -- freezes a user can spend
  total_xp        int  not null default 0,
  total_answered  int  not null default 0,
  total_correct   int  not null default 0,
  created_at      timestamptz not null default now()
);

create table profiles_private (
  id         uuid primary key references auth.users(id) on delete cascade,
  push_token text,
  updated_at timestamptz not null default now()
);

-- ============================================================================
-- Learning path: units (skills) -> levels (stages) -> questions
-- ============================================================================
create table units (
  id          bigint generated always as identity primary key,
  track       exam_track not null,
  name        text not null,
  description text,
  icon        text,                  -- icon identifier (no emoji), e.g. 'calculator'
  position    smallint not null,
  unique (track, position)
);

create table levels (
  id              bigint generated always as identity primary key,
  unit_id         bigint not null references units(id) on delete cascade,
  title           text,
  position        smallint not null,
  questions_count smallint not null default 10,
  unique (unit_id, position)
);

create table questions (
  id          bigint generated always as identity primary key,
  track       exam_track not null,
  level_id    bigint references levels(id) on delete set null,
  type        question_type not null default 'multiple_choice',
  difficulty  smallint not null default 3 check (difficulty between 1 and 5),
  elo         numeric  not null default 1000,   -- self-calibrating difficulty
  position    smallint not null default 0,
  body        text not null,
  image_url   text,
  explanation text not null,
  source      text,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);
create index questions_track_active_idx on questions (track, is_active);
create index questions_level_idx        on questions (level_id);

create table answer_options (
  id          bigint generated always as identity primary key,
  question_id bigint not null references questions(id) on delete cascade,
  label       text not null,
  body        text not null,
  is_correct  boolean not null default false,
  position    smallint not null
);
create index answer_options_question_idx on answer_options (question_id);

-- ============================================================================
-- User activity: answers, daily assignment, per-level progress
-- ============================================================================
create table user_answers (
  id                 bigint generated always as identity primary key,
  user_id            uuid not null references auth.users(id) on delete cascade,
  question_id        bigint not null references questions(id) on delete cascade,
  selected_option_id bigint references answer_options(id),
  is_correct         boolean not null,
  answered_on        date not null default current_date,
  created_at         timestamptz not null default now(),
  unique (user_id, question_id)              -- a question is solved once (lock)
);
create index user_answers_user_date_idx on user_answers (user_id, answered_on);

create table daily_assignments (
  id            bigint generated always as identity primary key,
  user_id       uuid not null references auth.users(id) on delete cascade,
  question_id   bigint not null references questions(id),
  assigned_date date not null default current_date,
  completed     boolean not null default false,
  unique (user_id, assigned_date)            -- one daily question per day
);

create table user_level_progress (
  id            bigint generated always as identity primary key,
  user_id       uuid not null references auth.users(id) on delete cascade,
  level_id      bigint not null references levels(id) on delete cascade,
  status        level_status not null default 'locked',
  stars         smallint not null default 0,
  correct_count smallint not null default 0,
  completed_at  timestamptz,
  unique (user_id, level_id)
);

create table user_ability (
  user_id        uuid not null references auth.users(id) on delete cascade,
  unit_id        bigint not null references units(id) on delete cascade,
  ability        numeric not null default 1000,
  questions_seen int not null default 0,
  primary key (user_id, unit_id)
);

-- ============================================================================
-- Social: friendships
-- ============================================================================
create table friendships (
  id          bigint generated always as identity primary key,
  requester   uuid not null references auth.users(id) on delete cascade,
  addressee   uuid not null references auth.users(id) on delete cascade,
  status      friend_status not null default 'pending',
  created_at  timestamptz not null default now(),
  check (requester <> addressee),
  unique (requester, addressee)
);
create index friendships_addressee_idx on friendships (addressee);

-- ============================================================================
-- New-user trigger: create profile + private row automatically
-- ============================================================================
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  uname text;
begin
  -- username from metadata, fallback to a slug of the user id
  uname := coalesce(
    nullif(new.raw_user_meta_data->>'username', ''),
    'user_' || substr(new.id::text, 1, 8)
  );
  insert into profiles (id, username, display_name)
  values (
    new.id,
    uname,
    coalesce(nullif(new.raw_user_meta_data->>'display_name', ''), uname)
  );
  insert into profiles_private (id) values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ============================================================================
-- Adaptive selection: next question whose difficulty is closest to ability
-- ============================================================================
create or replace function next_adaptive_question(p_user uuid, p_unit bigint)
returns bigint
language sql
stable
as $$
  with ab as (
    select coalesce(
      (select ability from user_ability where user_id = p_user and unit_id = p_unit),
      1000
    ) as a
  )
  select q.id
  from questions q, ab
  where q.level_id in (select id from levels where unit_id = p_unit)
    and q.is_active
    and q.id not in (select question_id from user_answers where user_id = p_user)
  order by abs(q.elo - ab.a) asc, random()
  limit 1;
$$;

-- ============================================================================
-- Daily streak processing (run nightly via pg_cron).
-- Anyone who did not act "yesterday" either spends a freeze (streak kept)
-- or has their streak reset to 0.
-- ============================================================================
create or replace function process_streaks()
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  -- spend a freeze for users who missed exactly the day and still have freezes
  update profiles
  set streak_freezes = streak_freezes - 1
  where last_active_date < (current_date - 1)
    and current_streak > 0
    and streak_freezes > 0;

  -- reset streak for users who missed and had no freeze to spend
  update profiles
  set current_streak = 0
  where last_active_date < (current_date - 1)
    and current_streak > 0
    and streak_freezes = 0;
end;
$$;

-- ============================================================================
-- Leaderboards (security definer so they can read across rows safely)
-- ============================================================================
create or replace function global_leaderboard(p_limit int default 50)
returns table (username text, display_name text, total_xp int, current_streak int)
language sql
stable
security definer set search_path = public
as $$
  select username, display_name, total_xp, current_streak
  from profiles
  order by total_xp desc, current_streak desc
  limit greatest(1, least(p_limit, 200));
$$;

create or replace function friends_leaderboard()
returns table (username text, display_name text, current_streak int, total_xp int, is_self boolean)
language sql
stable
security definer set search_path = public
as $$
  with my_friends as (
    select addressee as fid from friendships
      where requester = auth.uid() and status = 'accepted'
    union
    select requester as fid from friendships
      where addressee = auth.uid() and status = 'accepted'
    union
    select auth.uid()
  )
  select p.username, p.display_name, p.current_streak, p.total_xp,
         (p.id = auth.uid()) as is_self
  from profiles p
  join my_friends f on f.fid = p.id
  order by p.current_streak desc, p.total_xp desc;
$$;

-- ============================================================================
-- Row Level Security
-- ============================================================================
alter table profiles            enable row level security;
alter table profiles_private    enable row level security;
alter table units               enable row level security;
alter table levels              enable row level security;
alter table questions           enable row level security;
alter table answer_options      enable row level security;
alter table user_answers        enable row level security;
alter table daily_assignments   enable row level security;
alter table user_level_progress enable row level security;
alter table user_ability        enable row level security;
alter table friendships         enable row level security;

-- profiles: readable by any authenticated user (leaderboards / friends);
-- writable only by the owner.
create policy "profiles readable"   on profiles
  for select to authenticated using (true);
create policy "profiles own insert" on profiles
  for insert to authenticated with check (auth.uid() = id);
create policy "profiles own update" on profiles
  for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

-- profiles_private: owner only
create policy "private own" on profiles_private
  for all to authenticated using (auth.uid() = id) with check (auth.uid() = id);

-- content tables: read-only to authenticated users
create policy "units read"   on units          for select to authenticated using (true);
create policy "levels read"  on levels         for select to authenticated using (true);
create policy "questions read" on questions    for select to authenticated using (is_active);
create policy "options read" on answer_options for select to authenticated using (true);

-- per-user activity: owner only
create policy "answers own"  on user_answers
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "assignments own" on daily_assignments
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "progress own" on user_level_progress
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "ability own" on user_ability
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- friendships: visible to either party; created by requester; accepted by addressee
create policy "friends visible" on friendships
  for select to authenticated
  using (auth.uid() = requester or auth.uid() = addressee);
create policy "friends request" on friendships
  for insert to authenticated with check (auth.uid() = requester);
create policy "friends respond" on friendships
  for update to authenticated
  using (auth.uid() = addressee or auth.uid() = requester)
  with check (auth.uid() = addressee or auth.uid() = requester);
create policy "friends remove" on friendships
  for delete to authenticated
  using (auth.uid() = requester or auth.uid() = addressee);
