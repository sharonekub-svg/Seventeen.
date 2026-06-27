-- ============================================================================
-- 0004_unit_exams.sql  —  A timed "summary exam" at the end of every subject.
--
-- Each unit (subject) gets one extra level after its practice levels: a full
-- test that simulates the real thing, but drawn only from THAT subject's
-- question bank. It is timed and ramps up in difficulty (easy -> hard).
--
--     ... practice levels 1..10 ...  ->  [ מבחן מסכם ]  (timed, all-subject)
--
-- Exam composition (20 questions, presented easy -> hard):
--     4 easy   ->   6 medium   ->   10 hard
-- ============================================================================

alter table levels add column if not exists is_exam boolean not null default false;
-- Total time budget for a timed level (exam). NULL = untimed (practice levels).
alter table levels add column if not exists time_limit_seconds int;

-- One exam level per unit, positioned right after its last practice level.
-- Idempotent: only adds an exam where the unit doesn't already have one.
insert into levels (unit_id, position, title, questions_count, is_exam, time_limit_seconds)
select
  u.id,
  coalesce((select max(l.position) from levels l where l.unit_id = u.id), 0) + 1,
  'מבחן מסכם',
  20,
  true,
  1200                                   -- 20 minutes (~1 min / question)
from units u
where not exists (
  select 1 from levels l where l.unit_id = u.id and l.is_exam
);

-- Exam difficulty mix (larger than a practice level), in presentation order.
create or replace function exam_difficulty_plan()
returns table (band text, slots int, ord int)
language sql immutable
as $$
  select * from (values
    ('easy',    4, 1),
    ('medium',  6, 2),
    ('hard',   10, 3)
  ) as t(band, slots, ord);
$$;

-- Ordered question set for a unit exam: pulled from the whole subject's bank
-- (every practice level in the unit), composed 4 easy / 6 medium / 10 hard and
-- sorted easy -> hard. Only active questions that have answer options qualify.
-- The correct option is never exposed here.
create or replace function exam_questions(p_level_id bigint)
returns table (
  id         bigint,
  body       text,
  image_url  text,
  type       question_type,
  difficulty smallint,
  slot       int
)
language sql
stable
security definer
set search_path = public
as $$
  with target as (
    select unit_id from levels where id = p_level_id
  ),
  banded as (
    select
      q.id, q.body, q.image_url, q.type, q.difficulty, q.position,
      case
        when q.difficulty <= 2 then 'easy'
        when q.difficulty  = 3 then 'medium'
        else 'hard'
      end as band,
      row_number() over (
        partition by case
          when q.difficulty <= 2 then 'easy'
          when q.difficulty  = 3 then 'medium'
          else 'hard'
        end
        order by q.difficulty, q.position, q.id
      ) as rn
    from questions q
    join levels l on l.id = q.level_id
    join target t on t.unit_id = l.unit_id
    where q.is_active
      and not l.is_exam                       -- draw from practice questions only
      and exists (select 1 from answer_options o where o.question_id = q.id)
  ),
  picked as (
    select b.*
    from banded b
    join exam_difficulty_plan() p on p.band = b.band
    where b.rn <= p.slots
  )
  select
    id, body, image_url, type, difficulty,
    (row_number() over (order by difficulty, position, id))::int as slot
  from picked
  order by difficulty, position, id;
$$;

grant execute on function exam_difficulty_plan()  to authenticated;
grant execute on function exam_questions(bigint)  to authenticated;
