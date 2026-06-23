-- Question bank snapshot (content seed).
-- Run AFTER 0001_init.sql + 0002_seed.sql (which create units & levels).
-- Safe to run on a fresh database; it skips itself if questions already exist.
--
-- All content here is original or owned — never scraped from prep institutes.

do $$
declare
  qid bigint;
  l_daper_quant  bigint := (select id from levels where unit_id=1 and position=1);
  l_daper_verbal bigint := (select id from levels where unit_id=2 and position=1);
  l_daper_instr  bigint := (select id from levels where unit_id=4 and position=1);
  l_psy_alg      bigint := (select id from levels where unit_id=5 and position=1);
  l_psy_geo      bigint := (select id from levels where unit_id=6 and position=1);
  l_psy_verbal   bigint := (select id from levels where unit_id=8 and position=1);
begin
  if (select count(*) from public.questions) > 0 then
    raise notice 'questions already present — skipping content seed';
    return;
  end if;

  -- ============================ DAPER · חשיבה כמותית ============================
  insert into questions(track,level_id,type,difficulty,elo,position,body,explanation,source)
  values('daper',l_daper_quant,'multiple_choice',1,850,1,'בסדרה הבאה, מהו האיבר החסר?  2, 4, 8, 16, ?',
  'כל איבר מוכפל ב-2 כדי לקבל את הבא אחריו: 2×2=4, 4×2=8, 8×2=16. לכן האיבר הבא הוא 16×2=32.','seed_original') returning id into qid;
  insert into answer_options(question_id,label,body,is_correct,position) values
  (qid,'א','24',false,1),(qid,'ב','32',true,2),(qid,'ג','20',false,3),(qid,'ד','18',false,4);

  insert into questions(track,level_id,type,difficulty,elo,position,body,explanation,source)
  values('daper',l_daper_quant,'multiple_choice',1,850,2,'מהו האיבר החסר בסדרה?  3, 6, 9, 12, ?',
  'זוהי סדרה חשבונית שבה מוסיפים 3 בכל פעם: 3, 6, 9, 12. לכן האיבר הבא הוא 12+3=15.','seed_original') returning id into qid;
  insert into answer_options(question_id,label,body,is_correct,position) values
  (qid,'א','14',false,1),(qid,'ב','15',true,2),(qid,'ג','16',false,3),(qid,'ד','18',false,4);

  insert into questions(track,level_id,type,difficulty,elo,position,body,explanation,source)
  values('daper',l_daper_quant,'multiple_choice',2,1000,3,'5 פועלים בונים קיר ב-10 ימים. כמה ימים ייקח ל-10 פועלים לבנות אותו קיר (באותו קצב עבודה)?',
  'זהו יחס הפוך: ככל שיש יותר פועלים, נדרשים פחות ימים. סך העבודה = 5×10 = 50 ימי-עבודה. עם 10 פועלים: 50 ÷ 10 = 5 ימים.','seed_original') returning id into qid;
  insert into answer_options(question_id,label,body,is_correct,position) values
  (qid,'א','20',false,1),(qid,'ב','5',true,2),(qid,'ג','10',false,3),(qid,'ד','2',false,4);

  insert into questions(track,level_id,type,difficulty,elo,position,body,explanation,source)
  values('daper',l_daper_quant,'multiple_choice',1,900,4,'כמה הם 25% מתוך 200?',
  '25% הם רבע (1/4). רבע מ-200 הוא 200 ÷ 4 = 50.','seed_original') returning id into qid;
  insert into answer_options(question_id,label,body,is_correct,position) values
  (qid,'א','25',false,1),(qid,'ב','50',true,2),(qid,'ג','75',false,3),(qid,'ד','100',false,4);

  insert into questions(track,level_id,type,difficulty,elo,position,body,explanation,source)
  values('daper',l_daper_quant,'multiple_choice',2,1000,5,'מהו האיבר החסר בסדרה?  1, 4, 9, 16, ?',
  'אלו ריבועים של מספרים עוקבים: 1=1², 4=2², 9=3², 16=4². לכן האיבר הבא הוא 5²=25.','seed_original') returning id into qid;
  insert into answer_options(question_id,label,body,is_correct,position) values
  (qid,'א','20',false,1),(qid,'ב','24',false,2),(qid,'ג','25',true,3),(qid,'ד','30',false,4);

  -- ============================ DAPER · אנלוגיות מילוליות ============================
  insert into questions(track,level_id,type,difficulty,elo,position,body,explanation,source)
  values('daper',l_daper_verbal,'multiple_choice',1,900,1,'רופא : חולה  כמו  מורה : ____',
  'הקשר הוא בעל מקצוע מול מי שמקבל ממנו את השירות. הרופא מטפל בחולה, כמו שהמורה מלמד את התלמיד.','seed_original') returning id into qid;
  insert into answer_options(question_id,label,body,is_correct,position) values
  (qid,'א','ספר',false,1),(qid,'ב','תלמיד',true,2),(qid,'ג','כיתה',false,3),(qid,'ד','מנהל',false,4);

  insert into questions(track,level_id,type,difficulty,elo,position,body,explanation,source)
  values('daper',l_daper_verbal,'multiple_choice',2,1000,2,'צמא : מים  כמו  רעב : ____',
  'הקשר הוא תחושת מחסור מול מה שמספק אותה. מים מרווים צמא, כמו שלחם משביע רעב.','seed_original') returning id into qid;
  insert into answer_options(question_id,label,body,is_correct,position) values
  (qid,'א','לחם',true,1),(qid,'ב','צלחת',false,2),(qid,'ג','שובע',false,3),(qid,'ד','מסעדה',false,4);

  insert into questions(track,level_id,type,difficulty,elo,position,body,explanation,source)
  values('daper',l_daper_verbal,'multiple_choice',1,900,3,'ציפור : קן  כמו  דבורה : ____',
  'הקשר הוא בעל חיים מול המבנה שבו הוא חי. הציפור חיה בקן, הדבורה חיה בכוורת.','seed_original') returning id into qid;
  insert into answer_options(question_id,label,body,is_correct,position) values
  (qid,'א','דבש',false,1),(qid,'ב','כוורת',true,2),(qid,'ג','פרח',false,3),(qid,'ד','נחיל',false,4);

  insert into questions(track,level_id,type,difficulty,elo,position,body,explanation,source)
  values('daper',l_daper_verbal,'multiple_choice',2,1000,4,'גדול : ענק  כמו  קטן : ____',
  'הקשר הוא תכונה מול אותה תכונה בעוצמה קיצונית. ענק הוא גדול במיוחד, ולכן המקביל לקטן הוא זעיר.','seed_original') returning id into qid;
  insert into answer_options(question_id,label,body,is_correct,position) values
  (qid,'א','בינוני',false,1),(qid,'ב','זעיר',true,2),(qid,'ג','רחב',false,3),(qid,'ד','חלש',false,4);

  insert into questions(track,level_id,type,difficulty,elo,position,body,explanation,source)
  values('daper',l_daper_verbal,'multiple_choice',2,1000,5,'סופר : ספר  כמו  צייר : ____',
  'הקשר הוא יוצר מול היצירה שהוא מייצר. הסופר יוצר ספר, הצייר יוצר ציור. מכחול הוא הכלי ולכן מסיח.','seed_original') returning id into qid;
  insert into answer_options(question_id,label,body,is_correct,position) values
  (qid,'א','מכחול',false,1),(qid,'ב','ציור',true,2),(qid,'ג','מוזיאון',false,3),(qid,'ד','צבע',false,4);

  -- ============================ DAPER · הבנת הוראות ============================
  insert into questions(track,level_id,type,difficulty,elo,position,body,explanation,source)
  values('daper',l_daper_instr,'multiple_choice',1,850,1,'בחר את המספר הגדול ביותר מבין הבאים.',
  'משווים את הספרות: 71 גדול מ-27, מ-17 ומ-7. הקושי כאן בקריאה מדויקת של מה שמבקשים.','seed_original') returning id into qid;
  insert into answer_options(question_id,label,body,is_correct,position) values
  (qid,'א','17',false,1),(qid,'ב','71',true,2),(qid,'ג','7',false,3),(qid,'ד','27',false,4);

  insert into questions(track,level_id,type,difficulty,elo,position,body,explanation,source)
  values('daper',l_daper_instr,'multiple_choice',1,900,2,'אם היום יום שלישי, איזה יום יהיה בעוד יומיים?',
  'סופרים שני ימים קדימה מיום שלישי: יום אחד קדימה רביעי, יומיים קדימה חמישי.','seed_original') returning id into qid;
  insert into answer_options(question_id,label,body,is_correct,position) values
  (qid,'א','רביעי',false,1),(qid,'ב','חמישי',true,2),(qid,'ג','שישי',false,3),(qid,'ד','שני',false,4);

  insert into questions(track,level_id,type,difficulty,elo,position,body,explanation,source)
  values('daper',l_daper_instr,'multiple_choice',1,900,3,'בחר את המילה שאינה שייכת לקבוצה.',
  'תפוח, בננה וענב הם פירות, ואילו גזר הוא ירק. לכן גזר יוצא דופן.','seed_original') returning id into qid;
  insert into answer_options(question_id,label,body,is_correct,position) values
  (qid,'א','תפוח',false,1),(qid,'ב','בננה',false,2),(qid,'ג','גזר',true,3),(qid,'ד','ענב',false,4);

  insert into questions(track,level_id,type,difficulty,elo,position,body,explanation,source)
  values('daper',l_daper_instr,'multiple_choice',2,1000,4,'סדר את המספרים מהקטן לגדול ובחר את המספר האמצעי:  8, 3, 5',
  'הסדר מהקטן לגדול הוא 3, 5, 8. המספר האמצעי הוא 5.','seed_original') returning id into qid;
  insert into answer_options(question_id,label,body,is_correct,position) values
  (qid,'א','3',false,1),(qid,'ב','5',true,2),(qid,'ג','8',false,3),(qid,'ד','אין אמצעי',false,4);

  insert into questions(track,level_id,type,difficulty,elo,position,body,explanation,source)
  values('daper',l_daper_instr,'multiple_choice',1,850,5,'בחר את המילה ההפוכה במשמעותה למילה מהיר.',
  'ההפך ממהיר הוא איטי. זריז הוא מילה נרדפת למהיר ולכן מסיח.','seed_original') returning id into qid;
  insert into answer_options(question_id,label,body,is_correct,position) values
  (qid,'א','זריז',false,1),(qid,'ב','איטי',true,2),(qid,'ג','חזק',false,3),(qid,'ד','רחוק',false,4);

  -- ============================ PSYCHOMETRIC · כמותי – אלגברה ============================
  insert into questions(track,level_id,type,difficulty,elo,position,body,explanation,source)
  values('psychometric',l_psy_alg,'multiple_choice',3,1050,1,'מטילים 2 קוביות משחק הוגנות. מהו היחס בין ההסתברות שסכום תוצאות ההטלה יהיה 2, לבין ההסתברות שסכום תוצאות ההטלה יהיה 3?',
  'בהטלת שתי קוביות יש 36 תוצאות שוות-הסתברות. סכום 2 מתקבל רק בדרך אחת — (1,1) — ולכן הסתברותו 1/36. סכום 3 מתקבל בשתי דרכים — (1,2) ו-(2,1) — ולכן הסתברותו 2/36. היחס הוא (1/36) ÷ (2/36) = 1/2.','user_example') returning id into qid;
  insert into answer_options(question_id,label,body,is_correct,position) values
  (qid,'1','1',false,1),(qid,'2','1/2',true,2),(qid,'3','1/3',false,3),(qid,'4','2/3',false,4);

  insert into questions(track,level_id,type,difficulty,elo,position,body,explanation,source)
  values('psychometric',l_psy_alg,'multiple_choice',3,1050,2,'x% מ-y שווה ל-y% מ-8. כמה הוא x?',
  'נתרגם אחוזים לכפל: x% מ-y הם (x/100)·y, ו-y% מ-8 הם (y/100)·8. מהשוויון: (x·y)/100 = (8·y)/100, ולכן x·y = 8·y, ובחלוקה ב-y מקבלים x = 8. תובנה: a% מ-b שווה תמיד ל-b% מ-a.','user_example') returning id into qid;
  insert into answer_options(question_id,label,body,is_correct,position) values
  (qid,'1','8',true,1),(qid,'2','2',false,2),(qid,'3','50',false,3),(qid,'4','4y',false,4);

  insert into questions(track,level_id,type,difficulty,elo,position,body,explanation,source)
  values('psychometric',l_psy_alg,'multiple_choice',2,950,3,'כמה הם 12% מ-16⅔ (שש-עשרה ושני שליש)?',
  'נמיר את המספר המעורב לשבר: 16⅔ = 50/3. אחוז הוא חלוקה ב-100, כלומר 12% = 0.12. נכפיל: 0.12 × 50/3 = 600/300 = 2.','user_example') returning id into qid;
  insert into answer_options(question_id,label,body,is_correct,position) values
  (qid,'1','1',false,1),(qid,'2','2',true,2),(qid,'3','7/3',false,3),(qid,'4','16/3',false,4);

  insert into questions(track,level_id,type,difficulty,elo,position,body,explanation,source)
  values('psychometric',l_psy_alg,'multiple_choice',2,950,4,'1.2 · 0.2 : 8 = ?  (כלומר 1.2 כפול 0.2, חלקי 8)',
  'מבצעים משמאל לימין. תחילה הכפל: 1.2 × 0.2 = 0.24. אחר כך החלוקה: 0.24 ÷ 8 = 0.03. הסימן : משמעו חלוקה.','user_example') returning id into qid;
  insert into answer_options(question_id,label,body,is_correct,position) values
  (qid,'1','0.3',false,1),(qid,'2','0.09',false,2),(qid,'3','0.03',true,3),(qid,'4','0.04',false,4);

  insert into questions(track,level_id,type,difficulty,elo,position,body,explanation,source)
  values('psychometric',l_psy_alg,'multiple_choice',4,1150,5,'(5−√5)/(5+√5) + (5+√5)/(5−√5) = ?',
  'מאחדים למכנה משותף (5+√5)(5−√5). המונה הופך ל-(5−√5)² + (5+√5)² = (30−10√5) + (30+10√5) = 60. המכנה הוא הפרש ריבועים: 25 − 5 = 20. לכן הביטוי שווה 60 ÷ 20 = 3.','user_example') returning id into qid;
  insert into answer_options(question_id,label,body,is_correct,position) values
  (qid,'1','1',false,1),(qid,'2','5',false,2),(qid,'3','3',true,3),(qid,'4','4√5',false,4);

  insert into questions(track,level_id,type,difficulty,elo,position,body,explanation,source)
  values('psychometric',l_psy_alg,'multiple_choice',2,950,6,'89² − 11² = ?',
  'זהו הפרש ריבועים: a² − b² = (a − b)(a + b). כאן 89² − 11² = (89 − 11)(89 + 11) = 78 × 100 = 7800.','user_example') returning id into qid;
  insert into answer_options(question_id,label,body,is_correct,position) values
  (qid,'1','√7008',false,1),(qid,'2','7080',false,2),(qid,'3','78²',false,3),(qid,'4','7800',true,4);

  insert into questions(track,level_id,type,difficulty,elo,position,body,explanation,source)
  values('psychometric',l_psy_alg,'multiple_choice',3,1050,7,'מהירות האור נמדדה כ-900,000,000 קילומטרים בשעה, ומהירות הקול כ-250 מטרים בשנייה. מהו היחס בין מהירות הקול למהירות האור?',
  'מביאים לאותן יחידות. מהירות האור: 9×10⁸ קמ"ש = 9×10⁸ × 1000 ÷ 3600 = 2.5×10⁸ מטר לשנייה. מהירות הקול 250 מטר לשנייה. היחס קול:אור = 250 : 250,000,000 = 1 : 1,000,000.','user_example') returning id into qid;
  insert into answer_options(question_id,label,body,is_correct,position) values
  (qid,'1','1 : 1,000',false,1),(qid,'2','1 : 10,000',false,2),(qid,'3','1 : 100,000',false,3),(qid,'4','1 : 1,000,000',true,4);

  -- ============================ PSYCHOMETRIC · כמותי – גיאומטריה ============================
  insert into questions(track,level_id,type,difficulty,elo,position,body,explanation,source)
  values('psychometric',l_psy_geo,'multiple_choice',3,1050,1,'נתון מעגל שמרכזו O. זווית הגזרה האפורה היא 40°, ושטח הגזרה הוא π סמ"ר. מהו אורך רדיוס המעגל בס"מ?',
  'שטח גזרה = (הזווית/360°) × שטח המעגל = (40/360)·π·r² = (1/9)·π·r². נתון ששטח הגזרה הוא π, לכן (1/9)·π·r² = π, ומכאן r² = 9 ו-r = 3.','user_example') returning id into qid;
  insert into answer_options(question_id,label,body,is_correct,position) values
  (qid,'1','6',false,1),(qid,'2','9',false,2),(qid,'3','3',true,3),(qid,'4','4',false,4);

  insert into questions(track,level_id,type,difficulty,elo,position,body,explanation,source)
  values('psychometric',l_psy_geo,'multiple_choice',4,1200,2,'ABC הוא משולש שווה-צלעות החסום במעגל שרדיוסו r. הקטע CD הוא קוטר במעגל החוצה את הצלע AB בנקודה E. מהו אורך הקטע DE?',
  'במשולש שווה-צלעות החסום במעגל, המרכז O הוא מפגש התיכונים. הקוטר CD יוצא מ-C, עובר דרך O, וחוצה בניצב את AB באמצעה E. המרחק מהמרכז אל הצלע הוא r/2, כלומר OE = r/2. הנקודה D בקצה הקוטר, OD = r. לכן DE = OD − OE = r − r/2 = r/2.','user_example') returning id into qid;
  insert into answer_options(question_id,label,body,is_correct,position) values
  (qid,'1','r/2',true,1),(qid,'2','r/3',false,2),(qid,'3','r/√3',false,3),(qid,'4','(√3·r)/2',false,4);

  -- ============================ PSYCHOMETRIC · מילולי – אנלוגיות ============================
  insert into questions(track,level_id,type,difficulty,elo,position,body,explanation,source)
  values('psychometric',l_psy_verbal,'multiple_choice',3,1050,1,'נגר : נסורת',
  'הקשר הוא בעל מקצוע מול הפסולת הנוצרת מעבודתו. הנגר מנסר עץ והתוצר-לוואי הוא נסורת; הגנן גוזם והתוצר-לוואי הוא גזם. בפסל : שיש השיש הוא חומר הגלם ולא פסולת; בסופר : כריכות הכריכה היא חלק מהמוצר.','user_example') returning id into qid;
  insert into answer_options(question_id,label,body,is_correct,position) values
  (qid,'1','סופר : כריכות',false,1),(qid,'2','קוון : דגל',false,2),(qid,'3','פסל : שיש',false,3),(qid,'4','גנן : גזם',true,4);

  raise notice 'seeded % questions', (select count(*) from public.questions);
end $$;
