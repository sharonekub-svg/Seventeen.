-- ============================================================================
-- 0005_seed_questions.sql
-- Original starter question bank (authored, not scraped). 30 questions across
-- the first units of both tracks, making levels 1-4 playable. Inserted with
-- is_active = false; flipped to true after the sanity check (see report).
-- ============================================================================
with q as (
  insert into questions (track, level_id, type, difficulty, elo, position, body, explanation, is_active)
  values ('psychometric', 20, 'multiple_choice', 2, 925, 0, 'אם 3x + 5 = 20, מהו x?', 'מחסירים 5 משני האגפים: 3x = 15, ומחלקים ב-3: x = 5.', false)
  returning id
)
insert into answer_options (question_id, label, body, is_correct, position)
select q.id, v.label, v.body, v.is_correct, v.position
from q, (values ('1','5',true,0),('2','4',false,1),('3','15',false,2),('4','3',false,3)) as v(label, body, is_correct, position);
with q as (
  insert into questions (track, level_id, type, difficulty, elo, position, body, explanation, is_active)
  values ('psychometric', 20, 'multiple_choice', 2, 925, 1, 'פתרו את המשוואה 2(x − 3) = 10. מהו x?', 'מחלקים ב-2: x − 3 = 5, ומוסיפים 3: x = 8.', false)
  returning id
)
insert into answer_options (question_id, label, body, is_correct, position)
select q.id, v.label, v.body, v.is_correct, v.position
from q, (values ('1','8',true,0),('2','5',false,1),('3','2',false,2),('4','11',false,3)) as v(label, body, is_correct, position);
with q as (
  insert into questions (track, level_id, type, difficulty, elo, position, body, explanation, is_active)
  values ('psychometric', 20, 'multiple_choice', 2, 925, 2, 'אם x/4 = 9, מהו x?', 'כופלים את שני האגפים ב-4: x = 9 × 4 = 36.', false)
  returning id
)
insert into answer_options (question_id, label, body, is_correct, position)
select q.id, v.label, v.body, v.is_correct, v.position
from q, (values ('1','36',true,0),('2','13',false,1),('3','40',false,2),('4','2.25',false,3)) as v(label, body, is_correct, position);
with q as (
  insert into questions (track, level_id, type, difficulty, elo, position, body, explanation, is_active)
  values ('psychometric', 20, 'multiple_choice', 2, 925, 3, 'מהו ערך הביטוי 5a − 2 כאשר a = 4?', 'מציבים a = 4: 5×4 − 2 = 20 − 2 = 18.', false)
  returning id
)
insert into answer_options (question_id, label, body, is_correct, position)
select q.id, v.label, v.body, v.is_correct, v.position
from q, (values ('1','18',true,0),('2','20',false,1),('3','22',false,2),('4','17',false,3)) as v(label, body, is_correct, position);
with q as (
  insert into questions (track, level_id, type, difficulty, elo, position, body, explanation, is_active)
  values ('psychometric', 20, 'multiple_choice', 2, 925, 4, 'אם x + 7 = 3, מהו x?', 'מחסירים 7 משני האגפים: x = 3 − 7 = −4.', false)
  returning id
)
insert into answer_options (question_id, label, body, is_correct, position)
select q.id, v.label, v.body, v.is_correct, v.position
from q, (values ('1','−4',true,0),('2','4',false,1),('3','10',false,2),('4','−10',false,3)) as v(label, body, is_correct, position);
with q as (
  insert into questions (track, level_id, type, difficulty, elo, position, body, explanation, is_active)
  values ('psychometric', 35, 'multiple_choice', 3, 1000, 0, 'אם 4x − 7 = 2x + 9, מהו x?', 'מעבירים אגפים: 4x − 2x = 9 + 7, כלומר 2x = 16, ולכן x = 8.', false)
  returning id
)
insert into answer_options (question_id, label, body, is_correct, position)
select q.id, v.label, v.body, v.is_correct, v.position
from q, (values ('1','8',true,0),('2','4',false,1),('3','16',false,2),('4','2',false,3)) as v(label, body, is_correct, position);
with q as (
  insert into questions (track, level_id, type, difficulty, elo, position, body, explanation, is_active)
  values ('psychometric', 35, 'multiple_choice', 3, 1000, 1, 'הממוצע של שלושה מספרים הוא 14. מהו סכומם?', 'ממוצע = סכום ÷ כמות, ולכן הסכום = 14 × 3 = 42.', false)
  returning id
)
insert into answer_options (question_id, label, body, is_correct, position)
select q.id, v.label, v.body, v.is_correct, v.position
from q, (values ('1','42',true,0),('2','14',false,1),('3','17',false,2),('4','11',false,3)) as v(label, body, is_correct, position);
with q as (
  insert into questions (track, level_id, type, difficulty, elo, position, body, explanation, is_active)
  values ('psychometric', 35, 'multiple_choice', 3, 1000, 2, 'אם a + b = 10 ו-a − b = 4, מהו a?', 'מחברים את שתי המשוואות: 2a = 14, ולכן a = 7.', false)
  returning id
)
insert into answer_options (question_id, label, body, is_correct, position)
select q.id, v.label, v.body, v.is_correct, v.position
from q, (values ('1','7',true,0),('2','3',false,1),('3','5',false,2),('4','14',false,3)) as v(label, body, is_correct, position);
with q as (
  insert into questions (track, level_id, type, difficulty, elo, position, body, explanation, is_active)
  values ('psychometric', 35, 'multiple_choice', 3, 1000, 3, 'מהו פתרון אי-השוויון 3x > 12?', 'מחלקים ב-3 (מספר חיובי, הסימן נשמר): x > 4.', false)
  returning id
)
insert into answer_options (question_id, label, body, is_correct, position)
select q.id, v.label, v.body, v.is_correct, v.position
from q, (values ('1','x > 4',true,0),('2','x < 4',false,1),('3','x > 36',false,2),('4','x > 9',false,3)) as v(label, body, is_correct, position);
with q as (
  insert into questions (track, level_id, type, difficulty, elo, position, body, explanation, is_active)
  values ('psychometric', 35, 'multiple_choice', 3, 1000, 4, 'לאחר הנחה של 20% מחיר חולצה הוא 80 ש"ח. מה היה המחיר המקורי?', 'המחיר ששולם הוא 80% מהמקורי: מקורי = 80 ÷ 0.8 = 100 ש"ח.', false)
  returning id
)
insert into answer_options (question_id, label, body, is_correct, position)
select q.id, v.label, v.body, v.is_correct, v.position
from q, (values ('1','100',true,0),('2','96',false,1),('3','160',false,2),('4','64',false,3)) as v(label, body, is_correct, position);
with q as (
  insert into questions (track, level_id, type, difficulty, elo, position, body, explanation, is_active)
  values ('psychometric', 50, 'multiple_choice', 4, 1075, 0, 'אם x² = 49 ו-x < 0, מהו x?', 'השורשים של 49 הם 7 ו-(−7); מכיוון ש-x שלילי, x = −7.', false)
  returning id
)
insert into answer_options (question_id, label, body, is_correct, position)
select q.id, v.label, v.body, v.is_correct, v.position
from q, (values ('1','−7',true,0),('2','7',false,1),('3','49',false,2),('4','−49',false,3)) as v(label, body, is_correct, position);
with q as (
  insert into questions (track, level_id, type, difficulty, elo, position, body, explanation, is_active)
  values ('psychometric', 50, 'multiple_choice', 4, 1075, 1, 'נתון (x + 2)(x − 5) = 0. מהו הפתרון החיובי?', 'מכפלה מתאפסת כאשר אחד הגורמים מתאפס: x = −2 או x = 5. החיובי הוא 5.', false)
  returning id
)
insert into answer_options (question_id, label, body, is_correct, position)
select q.id, v.label, v.body, v.is_correct, v.position
from q, (values ('1','5',true,0),('2','−2',false,1),('3','2',false,2),('4','10',false,3)) as v(label, body, is_correct, position);
with q as (
  insert into questions (track, level_id, type, difficulty, elo, position, body, explanation, is_active)
  values ('psychometric', 50, 'multiple_choice', 4, 1075, 2, 'אם 2 בחזקת x שווה ל-32, מהו x?', '32 = 2×2×2×2×2 = 2 בחזקת 5, ולכן x = 5.', false)
  returning id
)
insert into answer_options (question_id, label, body, is_correct, position)
select q.id, v.label, v.body, v.is_correct, v.position
from q, (values ('1','5',true,0),('2','16',false,1),('3','6',false,2),('4','4',false,3)) as v(label, body, is_correct, position);
with q as (
  insert into questions (track, level_id, type, difficulty, elo, position, body, explanation, is_active)
  values ('psychometric', 50, 'multiple_choice', 4, 1075, 3, 'סכום שני מספרים שלמים עוקבים הוא 27. מהו הגדול שבהם?', 'מסמנים n ו-n+1: 2n + 1 = 27, ולכן n = 13 והגדול הוא 14.', false)
  returning id
)
insert into answer_options (question_id, label, body, is_correct, position)
select q.id, v.label, v.body, v.is_correct, v.position
from q, (values ('1','14',true,0),('2','13',false,1),('3','27',false,2),('4','12',false,3)) as v(label, body, is_correct, position);
with q as (
  insert into questions (track, level_id, type, difficulty, elo, position, body, explanation, is_active)
  values ('psychometric', 50, 'multiple_choice', 4, 1075, 4, 'רכב נסע 150 ק"מ במשך 2.5 שעות. מהי מהירותו הממוצעת (קמ"ש)?', 'מהירות = מרחק ÷ זמן = 150 ÷ 2.5 = 60 קמ"ש.', false)
  returning id
)
insert into answer_options (question_id, label, body, is_correct, position)
select q.id, v.label, v.body, v.is_correct, v.position
from q, (values ('1','60',true,0),('2','75',false,1),('3','375',false,2),('4','50',false,3)) as v(label, body, is_correct, position);
with q as (
  insert into questions (track, level_id, type, difficulty, elo, position, body, explanation, is_active)
  values ('daper', 16, 'multiple_choice', 2, 925, 0, 'כמה הם 15% מ-200?', '15% = 0.15, ולכן 0.15 × 200 = 30.', false)
  returning id
)
insert into answer_options (question_id, label, body, is_correct, position)
select q.id, v.label, v.body, v.is_correct, v.position
from q, (values ('1','30',true,0),('2','15',false,1),('3','300',false,2),('4','20',false,3)) as v(label, body, is_correct, position);
with q as (
  insert into questions (track, level_id, type, difficulty, elo, position, body, explanation, is_active)
  values ('daper', 16, 'multiple_choice', 2, 925, 1, 'עיפרון עולה 3 ש"ח. כמה עולים 7 עפרונות?', 'כופלים מחיר בכמות: 3 × 7 = 21 ש"ח.', false)
  returning id
)
insert into answer_options (question_id, label, body, is_correct, position)
select q.id, v.label, v.body, v.is_correct, v.position
from q, (values ('1','21',true,0),('2','10',false,1),('3','24',false,2),('4','18',false,3)) as v(label, body, is_correct, position);
with q as (
  insert into questions (track, level_id, type, difficulty, elo, position, body, explanation, is_active)
  values ('daper', 16, 'multiple_choice', 2, 925, 2, 'מהו האיבר הבא בסדרה: 2, 4, 6, 8, ...?', 'הסדרה עולה ב-2 בכל פעם, ולכן האיבר הבא הוא 8 + 2 = 10.', false)
  returning id
)
insert into answer_options (question_id, label, body, is_correct, position)
select q.id, v.label, v.body, v.is_correct, v.position
from q, (values ('1','10',true,0),('2','9',false,1),('3','12',false,2),('4','16',false,3)) as v(label, body, is_correct, position);
with q as (
  insert into questions (track, level_id, type, difficulty, elo, position, body, explanation, is_active)
  values ('daper', 16, 'multiple_choice', 2, 925, 3, 'כמה דקות יש ב-3 שעות?', 'בכל שעה 60 דקות, ולכן 3 × 60 = 180 דקות.', false)
  returning id
)
insert into answer_options (question_id, label, body, is_correct, position)
select q.id, v.label, v.body, v.is_correct, v.position
from q, (values ('1','180',true,0),('2','30',false,1),('3','300',false,2),('4','360',false,3)) as v(label, body, is_correct, position);
with q as (
  insert into questions (track, level_id, type, difficulty, elo, position, body, explanation, is_active)
  values ('daper', 16, 'multiple_choice', 2, 925, 4, 'אם חצי מהמספר הוא 12, מהו המספר?', 'אם חצי הוא 12, אז המספר השלם הוא 12 × 2 = 24.', false)
  returning id
)
insert into answer_options (question_id, label, body, is_correct, position)
select q.id, v.label, v.body, v.is_correct, v.position
from q, (values ('1','24',true,0),('2','6',false,1),('3','12',false,2),('4','36',false,3)) as v(label, body, is_correct, position);
with q as (
  insert into questions (track, level_id, type, difficulty, elo, position, body, explanation, is_active)
  values ('daper', 31, 'multiple_choice', 3, 1000, 0, 'בכיתה 30 תלמידים, 40% מהם בנות. כמה בנים יש בכיתה?', '40% בנות = 0.4 × 30 = 12 בנות, ולכן הבנים הם 30 − 12 = 18.', false)
  returning id
)
insert into answer_options (question_id, label, body, is_correct, position)
select q.id, v.label, v.body, v.is_correct, v.position
from q, (values ('1','18',true,0),('2','12',false,1),('3','40',false,2),('4','20',false,3)) as v(label, body, is_correct, position);
with q as (
  insert into questions (track, level_id, type, difficulty, elo, position, body, explanation, is_active)
  values ('daper', 31, 'multiple_choice', 3, 1000, 1, 'מהו הממוצע של 10, 20 ו-30?', 'ממוצע = (10 + 20 + 30) ÷ 3 = 60 ÷ 3 = 20.', false)
  returning id
)
insert into answer_options (question_id, label, body, is_correct, position)
select q.id, v.label, v.body, v.is_correct, v.position
from q, (values ('1','20',true,0),('2','30',false,1),('3','60',false,2),('4','15',false,3)) as v(label, body, is_correct, position);
with q as (
  insert into questions (track, level_id, type, difficulty, elo, position, body, explanation, is_active)
  values ('daper', 31, 'multiple_choice', 3, 1000, 2, '5 פועלים בונים קיר ב-10 ימים. כמה ימים יידרשו ל-10 פועלים (באותו קצב)?', 'סך העבודה הוא 50 ימי-פועל; חלוקה ל-10 פועלים נותנת 50 ÷ 10 = 5 ימים.', false)
  returning id
)
insert into answer_options (question_id, label, body, is_correct, position)
select q.id, v.label, v.body, v.is_correct, v.position
from q, (values ('1','5',true,0),('2','20',false,1),('3','10',false,2),('4','2',false,3)) as v(label, body, is_correct, position);
with q as (
  insert into questions (track, level_id, type, difficulty, elo, position, body, explanation, is_active)
  values ('daper', 31, 'multiple_choice', 3, 1000, 3, 'מהו האיבר הבא בסדרה: 3, 6, 12, 24, ...?', 'כל איבר מוכפל ב-2, ולכן האיבר הבא הוא 24 × 2 = 48.', false)
  returning id
)
insert into answer_options (question_id, label, body, is_correct, position)
select q.id, v.label, v.body, v.is_correct, v.position
from q, (values ('1','48',true,0),('2','36',false,1),('3','30',false,2),('4','96',false,3)) as v(label, body, is_correct, position);
with q as (
  insert into questions (track, level_id, type, difficulty, elo, position, body, explanation, is_active)
  values ('daper', 31, 'multiple_choice', 3, 1000, 4, 'כמה הם רבע מ-80 ועוד חצי מ-40?', 'רבע מ-80 הוא 20, חצי מ-40 הוא 20, והסכום הוא 20 + 20 = 40.', false)
  returning id
)
insert into answer_options (question_id, label, body, is_correct, position)
select q.id, v.label, v.body, v.is_correct, v.position
from q, (values ('1','40',true,0),('2','30',false,1),('3','60',false,2),('4','20',false,3)) as v(label, body, is_correct, position);
with q as (
  insert into questions (track, level_id, type, difficulty, elo, position, body, explanation, is_active)
  values ('daper', 46, 'multiple_choice', 4, 1075, 0, 'מחיר מוצר עלה ב-25% ועכשיו הוא 250 ש"ח. מה היה המחיר הקודם?', 'המחיר החדש הוא 125% מהקודם: קודם = 250 ÷ 1.25 = 200 ש"ח.', false)
  returning id
)
insert into answer_options (question_id, label, body, is_correct, position)
select q.id, v.label, v.body, v.is_correct, v.position
from q, (values ('1','200',true,0),('2','187.5',false,1),('3','225',false,2),('4','312.5',false,3)) as v(label, body, is_correct, position);
with q as (
  insert into questions (track, level_id, type, difficulty, elo, position, body, explanation, is_active)
  values ('daper', 46, 'multiple_choice', 4, 1075, 1, 'יחס הבנים לבנות בכיתה הוא 2:3, ובסך הכל 30 תלמידים. כמה בנות יש?', 'היחס מחלק את הכיתה ל-5 חלקים (2+3); כל חלק 6 תלמידים, והבנות הן 3×6 = 18.', false)
  returning id
)
insert into answer_options (question_id, label, body, is_correct, position)
select q.id, v.label, v.body, v.is_correct, v.position
from q, (values ('1','18',true,0),('2','12',false,1),('3','15',false,2),('4','20',false,3)) as v(label, body, is_correct, position);
with q as (
  insert into questions (track, level_id, type, difficulty, elo, position, body, explanation, is_active)
  values ('daper', 46, 'multiple_choice', 4, 1075, 2, 'אוטובוס נוסע במהירות 60 קמ"ש. כמה קילומטרים יעבור ב-40 דקות?', '40 דקות הן 2/3 שעה, ולכן 60 × 2/3 = 40 ק"מ.', false)
  returning id
)
insert into answer_options (question_id, label, body, is_correct, position)
select q.id, v.label, v.body, v.is_correct, v.position
from q, (values ('1','40',true,0),('2','60',false,1),('3','90',false,2),('4','24',false,3)) as v(label, body, is_correct, position);
with q as (
  insert into questions (track, level_id, type, difficulty, elo, position, body, explanation, is_active)
  values ('daper', 46, 'multiple_choice', 4, 1075, 3, 'במשולש שתי זוויות הן 50° ו-60°. מהי הזווית השלישית?', 'סכום הזוויות במשולש הוא 180°, ולכן השלישית היא 180 − 50 − 60 = 70°.', false)
  returning id
)
insert into answer_options (question_id, label, body, is_correct, position)
select q.id, v.label, v.body, v.is_correct, v.position
from q, (values ('1','70',true,0),('2','80',false,1),('3','90',false,2),('4','60',false,3)) as v(label, body, is_correct, position);
with q as (
  insert into questions (track, level_id, type, difficulty, elo, position, body, explanation, is_active)
  values ('daper', 46, 'multiple_choice', 4, 1075, 4, 'אם a = 3, מהו ערך הביטוי 2a² − a?', 'מציבים a = 3: 2×9 − 3 = 18 − 3 = 15.', false)
  returning id
)
insert into answer_options (question_id, label, body, is_correct, position)
select q.id, v.label, v.body, v.is_correct, v.position
from q, (values ('1','15',true,0),('2','33',false,1),('3','12',false,2),('4','9',false,3)) as v(label, body, is_correct, position);
