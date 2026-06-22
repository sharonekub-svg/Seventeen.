-- ============================================================================
-- 0002_seed.sql  —  Learning path content: units + 10 levels each.
-- Icons are lucide-style identifiers (rendered by the app), not emoji.
-- Questions themselves are added separately after human QA.
-- ============================================================================

-- ----- daper (adaptive screening test): 4 sections -----
insert into units (track, name, description, icon, position) values
  ('daper', 'חשיבה כמותית',     'בעיות הספק, אחוזים, יחסים, ממוצעים ומהירות', 'calculator', 1),
  ('daper', 'אנלוגיות מילוליות', 'אוצר מילים וקשר לוגי בין צמדי מילים',        'book-text',  2),
  ('daper', 'אנלוגיות צורניות',  'זיהוי חוקיות וקשרים לוגיים בין צורות',        'shapes',     3),
  ('daper', 'הבנת הוראות',       'ביצוע סדרת פעולות מדויקות לפי טקסט נתון',     'list-checks', 4);

-- ----- psychometric: 3 core domains + writing task -----
insert into units (track, name, description, icon, position) values
  ('psychometric', 'כמותי – אלגברה',          'משוואות, ביטויים, בעיות מילוליות',        'function-square', 1),
  ('psychometric', 'כמותי – גיאומטריה',        'זוויות, שטחים, נפחים וצורות',             'triangle-ruler',  2),
  ('psychometric', 'כמותי – גרפים וטבלאות',    'הסקת מסקנות מנתונים',                     'bar-chart-3',     3),
  ('psychometric', 'מילולי – אנלוגיות',        'קשר לוגי בין מילים',                      'link',            4),
  ('psychometric', 'מילולי – היסק ולוגיקה',    'הבנה והסקת מסקנות',                       'puzzle',          5),
  ('psychometric', 'מילולי – השלמת משפטים',    'בחירת ההשלמה הנכונה להקשר',               'pencil-line',     6),
  ('psychometric', 'מילולי – הבנת הנקרא',       'ניתוח טקסטים ארוכים',                     'book-open',       7),
  ('psychometric', 'אנגלית – Sentence Completion', 'אוצר מילים בהקשר',                   'languages',       8),
  ('psychometric', 'אנגלית – Restatement',     'ניסוח מחדש של משפטים',                    'repeat',          9),
  ('psychometric', 'אנגלית – Reading',         'הבנת הנקרא באנגלית',                      'newspaper',       10),
  ('psychometric', 'מטלת כתיבה',               'חיבור טיעון מובנה',                       'file-pen',        11);

-- ----- 10 levels per unit -----
insert into levels (unit_id, position, title, questions_count)
select u.id, gs, 'שלב ' || gs, 5
from units u
cross join generate_series(1, 10) as gs;
