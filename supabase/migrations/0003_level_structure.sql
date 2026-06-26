-- ============================================================================
-- 0003_level_structure.sql  —  Graduated 10-question level structure.
--
-- A level is no longer a flat bag of random questions. Each level is a fixed
-- set of 10 questions that ramps up in difficulty:
--
--     2 easy  ->  3 medium  ->  5 hard           (presented in that order)
--
-- Difficulty bands map onto questions.difficulty (1..5):
--     easy   = 1..2
--     medium = 3
--     hard   = 4..5
--
-- Only *real, answerable* questions are eligible: a question must be active
-- and have at least one answer option. This keeps a level from filling its
-- easy slots with random/empty placeholders.
-- ============================================================================

-- Existing rows were seeded with 5; bring them up to the new size.
update levels set questions_count = 10 where questions_count <> 10;

-- The composition each level aims for, in presentation order.
-- (easy first, hardest last)
create or replace function level_difficulty_plan()
returns table (band text, slots int, ord int)
language sql immutable
as $$
  select * from (values
    ('easy',   2, 1),
    ('medium', 3, 2),
    ('hard',   5, 3)
  ) as t(band, slots, ord);
$$;

-- Returns the ordered question set for a level: up to 2 easy, 3 medium, 5 hard,
-- sorted easy -> hard. `slot` is the 1-based position in the level (1..10).
-- The correct option is never exposed here.
create or replace function level_questions(p_level_id bigint)
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
  with banded as (
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
    where q.level_id = p_level_id
      and q.is_active
      and exists (select 1 from answer_options o where o.question_id = q.id)
  ),
  picked as (
    select b.*
    from banded b
    join level_difficulty_plan() p on p.band = b.band
    where b.rn <= p.slots
  )
  select
    id, body, image_url, type, difficulty,
    (row_number() over (order by difficulty, position, id))::int as slot
  from picked
  order by difficulty, position, id;
$$;

grant execute on function level_difficulty_plan()        to authenticated;
grant execute on function level_questions(bigint)        to authenticated;
