#!/usr/bin/env node
// ============================================================================
// gen-reading.mjs — emit ORIGINAL reading-comprehension questions (levels 3-10)
// for both מילולי – הבנת הנקרא (Hebrew) and אנגלית – Reading (English).
//
//   node scripts/gen-reading.mjs
//
// Each level has one original passage and five questions about it (main idea,
// explicit detail, inference, vocabulary-in-context, purpose). The passage is
// embedded in every question's `body` — the bank's existing convention, which
// needs no schema/app change. Answer positions are deterministically rotated so
// the correct option is not always in the same slot. Content is original.
// Levels 1-2 stay in psy-reading.json / eng-reading.json.
// ============================================================================

import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const HE_OUT = join(ROOT, "supabase", "content", "questions", "psy-reading-3-10.json");
const EN_OUT = join(ROOT, "supabase", "content", "questions", "eng-reading-3-10.json");

// q = [questionText, [opt0..opt3] with correct FIRST, explanation]
const HE = [
  { lv: 3, diff: 2, passage: "המים חיוניים לכל יצור חי. גוף האדם מורכב ברובו ממים, והם מסייעים לוויסות חום הגוף ולהובלת חומרי מזון לתאים. מומלץ לשתות מים לאורך כל היום, ובמיוחד בימים חמים ובזמן פעילות גופנית.", qs: [
    ["מהו הנושא המרכזי של הקטע?", ["חשיבות המים לגוף האדם", "דרכים לבישול בריא", "סוגי פעילות גופנית", "מבנה התא"], "הקטע עוסק כולו בתפקידי המים ובחשיבותם לגוף."],
    ["לפי הקטע, מתי חשוב במיוחד לשתות מים?", ["בימים חמים ובזמן פעילות גופנית", "רק בבוקר", "רק כשמרגישים צמא", "רק בחורף"], "נכתב במפורש: 'במיוחד בימים חמים ובזמן פעילות גופנית'."],
    ["כיצד המים מסייעים לגוף לפי הקטע?", ["בוויסות חום הגוף ובהובלת חומרי מזון", "בחיזוק העצמות בלבד", "בשיפור הראייה", "בהאצת הצמיחה"], "הקטע מציין ויסות חום הגוף והובלת חומרי מזון לתאים."],
    ["מה ניתן להסיק מהקטע?", ["לגוף האדם קשה לתפקד ללא מים מספקים", "שתיית מים מזיקה בקיץ", "מים אינם חשובים לילדים", "אפשר להחליף מים בכל משקה"], "מכיוון שהמים חיוניים ומבצעים תפקידים מרכזיים, מחסור בהם יפגע בתפקוד."],
    ["המילה 'חיוניים' בקטע פירושה:", ["הכרחיים מאוד", "מיותרים", "מזיקים", "יקרים"], "'חיוני' = הכרחי, שאי אפשר בלעדיו."],
  ] },
  { lv: 4, diff: 3, passage: "הספרייה הציבורית היא מוסד הפתוח לכול. בעבר שימשה בעיקר להשאלת ספרים, אך כיום היא מציעה גם מחשבים, סדנאות ומפגשי קריאה לילדים. רבים מגיעים אליה כדי ללמוד בשקט או למצוא מידע אמין. הכניסה לרוב הספריות הציבוריות אינה כרוכה בתשלום.", qs: [
    ["מהו הנושא המרכזי של הקטע?", ["תפקידה המתרחב של הספרייה הציבורית", "כיצד מחברים ספרים", "תולדות הדפוס", "מחירי ספרים"], "הקטע מתאר כיצד תפקיד הספרייה התרחב מעבר להשאלת ספרים."],
    ["אילו שירותים מציעה הספרייה כיום מעבר להשאלת ספרים?", ["מחשבים, סדנאות ומפגשי קריאה", "מכירת מזון", "השכרת רכבים", "שיעורי נהיגה"], "נכתב: 'מציעה גם מחשבים, סדנאות ומפגשי קריאה לילדים'."],
    ["מהי עלות הכניסה לרוב הספריות הציבוריות?", ["ללא תשלום", "תשלום חודשי גבוה", "תשלום לפי שעה", "תשלום עבור כל ספר"], "נכתב: 'הכניסה... אינה כרוכה בתשלום'."],
    ["מה ניתן להסיק על הספרייה בעבר לעומת היום?", ["תפקידה התרחב מעבר להשאלת ספרים בלבד", "היא הצטמצמה מאוד", "היא נסגרה לקהל", "היא יקרה יותר מבעבר"], "בעבר שימשה בעיקר להשאלה, וכיום מציעה שירותים נוספים."],
    ["לשם מה מגיעים רבים לספרייה לפי הקטע?", ["ללמוד בשקט ולמצוא מידע אמין", "לצפות בסרטים", "לשחק כדורגל", "לקנות בגדים"], "נכתב: 'כדי ללמוד בשקט או למצוא מידע אמין'."],
  ] },
  { lv: 5, diff: 3, passage: "המיחזור הוא תהליך שבו חומרים משומשים הופכים לחומרי גלם חדשים. במקום לזרוק בקבוקי פלסטיק ופחיות לפח, אפשר לאסוף אותם ולהמיר אותם למוצרים חדשים. המיחזור חוסך אנרגיה, מפחית את כמות הפסולת ומקטין את הזיהום. עם זאת, הצלחתו תלויה בשיתוף פעולה של התושבים, המפרידים את הפסולת בבתיהם.", qs: [
    ["מהו הנושא המרכזי של הקטע?", ["מהו המיחזור וכיצד הוא תורם לסביבה", "כיצד מייצרים פלסטיק", "תולדות פח האשפה", "מחירי חומרי גלם"], "הקטע מסביר את המיחזור ואת תרומתו לסביבה."],
    ["אילו יתרונות יש למיחזור לפי הקטע?", ["חיסכון באנרגיה, הפחתת פסולת והקטנת זיהום", "הגדלת הפסולת", "ייקור החשמל", "זיהום נוסף"], "נכתב: 'חוסך אנרגיה, מפחית את כמות הפסולת ומקטין את הזיהום'."],
    ["במה תלויה הצלחת המיחזור?", ["בשיתוף פעולה של התושבים בהפרדת הפסולת", "במזג האוויר", "במספר המפעלים בלבד", "בעונות השנה"], "נכתב: 'הצלחתו תלויה בשיתוף פעולה של התושבים'."],
    ["מה מרמז הקטע על תפקיד הפרט?", ["לכל אדם יש חלק חשוב בהצלחת המיחזור", "לפרט אין כל השפעה", "רק הממשלה אחראית", "המיחזור מתבצע מאליו"], "אם ההצלחה תלויה בהפרדה בבתים, הרי שלכל פרט יש תפקיד."],
    ["'חומרי גלם' בקטע פירושם:", ["חומרים בסיסיים שמהם מייצרים מוצרים", "מוצרים מוגמרים", "פסולת רעילה", "כלי עבודה"], "חומרי גלם הם החומרים הבסיסיים לייצור."],
  ] },
  { lv: 6, diff: 3, passage: "מחקרים מצביעים על קשר הדוק בין שינה לזיכרון. בזמן השינה המוח מעבד את המידע שנצבר במהלך היום ומעביר אותו לזיכרון לטווח ארוך. אנשים שישנים מעט מתקשים לעיתים לזכור פרטים ולהתרכז. לכן, שינה מספקת אינה מותרות אלא צורך חיוני ללמידה יעילה.", qs: [
    ["מהו הנושא המרכזי של הקטע?", ["הקשר בין שינה לזיכרון וללמידה", "כמה שעות ביממה", "סוגי חלומות", "מיטות נוחות"], "הקטע עוסק בקשר שבין שינה, זיכרון ולמידה."],
    ["מה עושה המוח בזמן השינה לפי הקטע?", ["מעבד מידע ומעביר אותו לזיכרון ארוך טווח", "מפסיק לפעול לחלוטין", "שוכח את כל היום", "מייצר אנרגיה לשרירים"], "נכתב: 'המוח מעבד את המידע... ומעביר אותו לזיכרון לטווח ארוך'."],
    ["מה מאפיין אנשים שישנים מעט?", ["קושי לזכור פרטים ולהתרכז", "זיכרון משופר", "ערנות יתרה", "אין כל השפעה"], "נכתב: 'מתקשים לעיתים לזכור פרטים ולהתרכז'."],
    ["מה הכותב מבקש להדגיש במשפט האחרון?", ["ששינה היא צורך חיוני ולא מותרות", "ששינה היא בזבוז זמן", "שאפשר לוותר על שינה", "שלמידה אינה חשובה"], "המשפט מנגיד 'מותרות' מול 'צורך חיוני' כדי להדגיש את חשיבות השינה."],
    ["'מותרות' בהקשר זה פירושו:", ["דבר נעים אך לא הכרחי", "צורך בסיסי", "מחלה", "עונש"], "מותרות = מה שנחמד אך אפשר בלעדיו — והכותב טוען שדווקא אי אפשר."],
  ] },
  { lv: 7, diff: 4, passage: "המצאת מכונת הדפוס במאה ה-15 חוללה מהפכה בהפצת הידע. עד אז הועתקו ספרים ביד, תהליך איטי ויקר שהותיר את הקריאה נחלתם של מעטים. הדפוס איפשר להפיק ספרים רבים במהירות ובמחיר נמוך יחסית. כתוצאה מכך גברה האוריינות, והרעיונות התפשטו במהירות חסרת תקדים בין מדינות ויבשות.", qs: [
    ["מהו הנושא המרכזי של הקטע?", ["השפעת מכונת הדפוס על הפצת הידע", "כיצד מתקנים מכונות", "תולדות הנייר", "חיי הסופרים בימי הביניים"], "הקטע מתאר כיצד הדפוס שינה את הפצת הידע."],
    ["כיצד הועתקו ספרים לפני המצאת הדפוס?", ["ביד, בתהליך איטי ויקר", "במכונה מהירה", "לא הועתקו כלל", "בעזרת מחשבים"], "נכתב: 'הועתקו ספרים ביד, תהליך איטי ויקר'."],
    ["מה הייתה תוצאה של המצאת הדפוס לפי הקטע?", ["עלייה באוריינות והתפשטות רעיונות", "ירידה במספר הקוראים", "התייקרות הספרים", "היעלמות הספרים"], "נכתב: 'גברה האוריינות, והרעיונות התפשטו'."],
    ["מדוע הקריאה הייתה 'נחלתם של מעטים' לפני הדפוס?", ["משום שספרים היו יקרים ונדירים", "משום שאנשים לא רצו לקרוא", "משום שלא היו שפות", "משום שהקריאה נאסרה"], "ההעתקה ביד הפכה ספרים ליקרים ונדירים, ולכן נגישים למעטים."],
    ["'חסרת תקדים' בקטע פירושה:", ["שלא הייתה כמותה בעבר", "איטית מאוד", "צפויה מראש", "חסרת חשיבות"], "'חסר תקדים' = שלא היה לו דבר דומה קודם לכן."],
  ] },
  { lv: 8, diff: 4, passage: "שוניות האלמוגים נחשבות לאחת המערכות האקולוגיות העשירות ביותר בכדור הארץ. אף שהן מכסות שטח קטן מאוד מקרקעית הים, הן מספקות בית לכרבע ממיני הדגים בעולם. האלמוגים רגישים במיוחד לשינויי טמפרטורה, ועלייה קלה בחום המים עלולה לגרום ל'הלבנתם' ולמותם. שמירה על השוניות חיונית אפוא לא רק ליופיין, אלא לעצם קיומו של מגוון המינים בים.", qs: [
    ["מהו הנושא המרכזי של הקטע?", ["חשיבותן ושבריריותן של שוניות האלמוגים", "צלילה ספורטיבית", "דרכי דיג", "צבעי הים"], "הקטע מדגיש הן את חשיבות השוניות והן את רגישותן."],
    ["איזה חלק ממיני הדגים תלוי בשוניות?", ["כרבע ממיני הדגים", "כל הדגים", "פחות מאחוז", "כמחצית"], "נכתב: 'בית לכרבע ממיני הדגים בעולם'."],
    ["מה עלול לגרום ל'הלבנת' האלמוגים?", ["עלייה בטמפרטורת המים", "ירידה במליחות בלבד", "ריבוי דגים", "גלים גבוהים"], "נכתב: 'עלייה קלה בחום המים עלולה לגרום ל\\'הלבנתם\\''."],
    ["מדוע שמירה על השוניות חשובה מעבר ליופיין?", ["משום שהן חיוניות למגוון המינים בים", "משום שהן מקור לזהב", "משום שהן מייצרות חמצן יבשתי", "משום שהן מונעות גאות"], "נכתב שהשמירה חיונית 'לעצם קיומו של מגוון המינים בים'."],
    ["המילה 'אף' בפתח המשפט השני מציינת:", ["ניגוד בין השטח הקטן לתרומה הגדולה", "הוספת פרט", "סיבה ותוצאה", "דוגמה"], "'אף ש...' פותח ניגוד: למרות השטח הקטן, התרומה עצומה."],
  ] },
  { lv: 9, diff: 5, passage: "כלכלנים הניחו זמן רב כי בני האדם מקבלים החלטות באופן רציונלי, מתוך שקילה קרה של עלויות ותועלות. אולם מחקרים בכלכלה התנהגותית הראו כי החלטותינו מושפעות עמוקות מהטיות, מרגשות ומאופן הצגת המידע. כך למשל, אנשים נוטים לחוש את כאב ההפסד בעוצמה רבה יותר מהנאת הרווח השקול לו. תובנות אלו ערערו על הנחת ה'אדם הרציונלי' ושינו את האופן שבו אנו מבינים בחירות כלכליות.", qs: [
    ["מהו הנושא המרכזי של הקטע?", ["כיצד הכלכלה ההתנהגותית ערערה על הנחת האדם הרציונלי", "כיצד לחסוך כסף", "תולדות הבורסה", "שערי מטבע"], "הקטע מתאר כיצד ממצאי הכלכלה ההתנהגותית ערערו הנחה ותיקה."],
    ["מה הניחו כלכלנים זמן רב?", ["שבני אדם מקבלים החלטות באופן רציונלי", "שבני אדם פועלים באקראי", "שאי אפשר לחזות החלטות", "שרגשות חשובים מהכול"], "נכתב: 'הניחו... כי בני האדם מקבלים החלטות באופן רציונלי'."],
    ["מהי הדוגמה שמביא הקטע להטיה?", ["כאב ההפסד נחווה חזק יותר מהנאת רווח שווה לו", "אנשים אדישים לכסף", "אנשים מעדיפים תמיד סיכון", "רווח גדול אינו משמח"], "נכתב במפורש על עוצמת כאב ההפסד מול הנאת הרווח."],
    ["מה ניתן להסיק מהקטע?", ["גורמים לא-רציונליים משפיעים על בחירות כלכליות", "החלטות כלכליות תמיד נכונות", "רגשות אינם משפיעים על כסף", "כלכלנים צדקו לחלוטין"], "אם הטיות ורגשות משפיעים, הרי שההחלטות אינן רציונליות בלבד."],
    ["'אופן הצגת המידע' (מסגור) בקטע מתייחס ל:", ["הדרך שבה המידע מוצג בפנינו", "כמות המידע בלבד", "מקור המידע", "אמיתות המידע"], "מסגור = כיצד מוצג המידע, מה שמשפיע על ההחלטה."],
  ] },
  { lv: 10, diff: 5, passage: "שאלה עתיקה מעסיקה חוקרים: האם השפה שאנו דוברים מעצבת את אופן חשיבתנו? לפי השערה ידועה, דוברי שפות שונות תופסים את העולם בדרכים שונות במקצת — למשל, באבחנה בין גוונים של צבע או בתפיסת הזמן והמרחב. מבקרי ההשערה טוענים כי ההבדלים מינוריים וכי המחשבה האנושית אוניברסלית בבסיסה. הוויכוח נמשך, אך שני הצדדים מסכימים כי הקשר בין שפה למחשבה מורכב מכפי שנדמה.", qs: [
    ["מהו הנושא המרכזי של הקטע?", ["הוויכוח על השפעת השפה על המחשבה", "כיצד ללמוד שפה זרה", "תולדות הכתב", "דקדוק עברי"], "הקטע מציג מחלוקת על הקשר בין שפה למחשבה."],
    ["מה טוענת ההשערה המוצגת בקטע?", ["דוברי שפות שונות תופסים את העולם מעט אחרת", "כל השפות זהות", "השפה אינה משפיעה כלל", "אי אפשר לתרגם בין שפות"], "ההשערה גורסת שדוברי שפות שונות תופסים את העולם בדרכים שונות במקצת."],
    ["מה טוענים מבקרי ההשערה?", ["ההבדלים מינוריים והמחשבה אוניברסלית בבסיסה", "השפה קובעת הכול", "אין מחשבה ללא שפה", "כל אדם חושב אחרת לגמרי"], "נכתב: 'המבקרים טוענים כי ההבדלים מינוריים וכי המחשבה... אוניברסלית'."],
    ["על מה מסכימים שני הצדדים בוויכוח?", ["שהקשר בין שפה למחשבה מורכב", "שההשערה הוכחה סופית", "שאין כל קשר בין שפה למחשבה", "שיש להפסיק את המחקר"], "נכתב: 'שני הצדדים מסכימים כי הקשר... מורכב מכפי שנדמה'."],
    ["'אוניברסלית' בקטע פירושה:", ["משותפת לכלל בני האדם", "ייחודית לכל אדם", "מורכבת מאוד", "משתנה בכל יום"], "אוניברסלי = כללי, משותף לכול."],
  ] },
];

const EN = [
  { lv: 3, diff: 2, passage: "The Sun is the closest star to Earth. It gives us light and heat, which living things need to survive. Plants use sunlight to make their food, and this process supports almost all life on the planet.", qs: [
    ["What is the passage mainly about?", ["The importance of the Sun to life on Earth", "How plants grow flowers", "The distance between stars", "Different kinds of weather"], "הקטע כולו עוסק בתפקיד השמש בקיום החיים על כדור הארץ."],
    ["What do plants use sunlight for?", ["To make their food", "To change color", "To stay cool", "To move around"], "נכתב: 'Plants use sunlight to make their food'."],
    ["Why is the Sun important to living things?", ["It gives light and heat they need to survive", "It blocks the wind", "It cleans the air", "It creates the oceans"], "נכתב: 'It gives us light and heat, which living things need to survive'."],
    ["What can be inferred from the passage?", ["Without the Sun, most life on Earth could not survive", "Plants do not need light", "The Sun is very far and unimportant", "Animals make their own food"], "אם החיים תלויים באור ובחום השמש, בלעדיה רובם לא ישרדו."],
    ["The word 'survive' means:", ["to stay alive", "to grow taller", "to move fast", "to fall asleep"], "survive = להישאר בחיים."],
  ] },
  { lv: 4, diff: 3, passage: "Riding a bicycle is a healthy and cheap way to travel. Unlike cars, bicycles do not burn fuel or release pollution into the air. Many cities have built special lanes to make cycling safer. As a result, more people now choose bikes for short trips around town.", qs: [
    ["What is the main idea of the passage?", ["The benefits of using bicycles for travel", "How to repair a car engine", "The history of city streets", "Why fuel is expensive"], "הקטע מתאר את היתרונות של שימוש באופניים."],
    ["How are bicycles different from cars, according to the passage?", ["They do not burn fuel or pollute", "They are always faster", "They cost more to buy", "They need special fuel"], "נכתב: 'bicycles do not burn fuel or release pollution'."],
    ["What have many cities built?", ["Special lanes for cycling", "Larger car parks", "New fuel stations", "Taller buildings"], "נכתב: 'Many cities have built special lanes'."],
    ["Why do more people now choose bikes for short trips?", ["Because cycling has become safer, and it is cheap and healthy", "Because cars were banned", "Because bikes are faster than trains", "Because fuel is free"], "השילוב של בטיחות, מחיר נמוך ובריאות מסביר את הבחירה."],
    ["The word 'pollution' means:", ["harmful substances released into the air", "heavy traffic", "loud noise", "bright light"], "pollution = זיהום, חומרים מזיקים באוויר."],
  ] },
  { lv: 5, diff: 3, passage: "Online shopping has changed the way people buy goods. Instead of visiting stores, customers can order products from home and have them delivered. This is convenient and often cheaper, but it has also made it harder for small local shops to compete. Some towns have seen many of their stores close.", qs: [
    ["What is the passage mainly about?", ["How online shopping has changed buying and affected local shops", "How to start a website", "The history of delivery trucks", "How to save money on food"], "הקטע עוסק בהשפעת הקנייה המקוונת על הצרכנים ועל החנויות הקטנות."],
    ["What is one advantage of online shopping mentioned?", ["It is convenient and often cheaper", "It is always slower", "It supports local shops", "It requires visiting stores"], "נכתב: 'This is convenient and often cheaper'."],
    ["What problem has online shopping caused?", ["It is harder for small local shops to compete", "Deliveries became impossible", "Products became more expensive everywhere", "People stopped buying anything"], "נכתב: 'harder for small local shops to compete'."],
    ["What can be inferred about some towns?", ["They lost local shops partly because of online competition", "They banned online shopping", "They built many new stores", "They have no shops at all"], "סגירת חנויות בערים נקשרת לתחרות מצד הקנייה המקוונת."],
    ["The word 'compete' means:", ["to try to do better than others", "to close down", "to deliver goods", "to lower prices only"], "compete = להתחרות, לנסות להצליח מול אחרים."],
  ] },
  { lv: 6, diff: 3, passage: "Volcanoes form where hot melted rock rises from deep inside the Earth. When a volcano erupts, it can release ash, gas, and rivers of lava. Although eruptions can be dangerous, the soil around volcanoes is often very fertile. For this reason, many people choose to live and farm near them despite the risks.", qs: [
    ["What is the main idea of the passage?", ["Both the dangers and the benefits of volcanoes", "How to climb a mountain", "The coldest places on Earth", "How rivers are formed"], "הקטע מציג גם את הסכנות וגם את היתרונות של החיים ליד הרי געש."],
    ["What can a volcano release when it erupts?", ["Ash, gas, and lava", "Snow and ice", "Fresh water only", "Sand and dust only"], "נכתב: 'release ash, gas, and rivers of lava'."],
    ["Why do many people live near volcanoes?", ["The soil there is often very fertile", "Volcanoes are always safe", "There is no other land", "The weather is always cold"], "נכתב: 'the soil around volcanoes is often very fertile'."],
    ["What does the passage suggest about these people's choice?", ["They accept the risk in return for fertile soil", "They are unaware of any danger", "They never farm the land", "They dislike farming"], "הם בוחרים לחיות שם 'despite the risks' בזכות האדמה הפורייה."],
    ["The word 'fertile' means:", ["good for growing plants", "very dry", "extremely hot", "covered in rock"], "fertile = פורה, טוב לגידול צמחים."],
  ] },
  { lv: 7, diff: 4, passage: "Reading regularly does more than entertain. Studies suggest that people who read often have larger vocabularies and find it easier to concentrate. Reading fiction, in particular, may improve empathy, since it asks readers to imagine the thoughts and feelings of others. These benefits appear whether one reads on paper or on a screen.", qs: [
    ["What is the main idea of the passage?", ["The wider benefits of regular reading", "Why paper books are better than screens", "How to write a novel", "The cost of books"], "הקטע מתאר את היתרונות הרחבים של קריאה קבועה."],
    ["Which benefit is linked specifically to reading fiction?", ["Improved empathy", "Faster typing", "Better eyesight", "A larger income"], "נכתב: 'Reading fiction, in particular, may improve empathy'."],
    ["Does the format (paper or screen) change the benefits, according to the passage?", ["No, the benefits appear either way", "Yes, only paper helps", "Yes, only screens help", "The passage does not say"], "נכתב: 'These benefits appear whether one reads on paper or on a screen'."],
    ["Why might fiction improve empathy?", ["Because it makes readers imagine others' thoughts and feelings", "Because it is always short", "Because it uses simple words", "Because it is read quickly"], "נכתב: 'it asks readers to imagine the thoughts and feelings of others'."],
    ["The word 'empathy' means:", ["the ability to understand others' feelings", "the ability to read fast", "a kind of memory", "a large vocabulary"], "empathy = אמפתיה, היכולת להבין את רגשות הזולת."],
  ] },
  { lv: 8, diff: 4, passage: "Each year, millions of birds undertake long migrations, traveling thousands of kilometers between their breeding and wintering grounds. Scientists believe birds navigate using the Sun, the stars, and even the Earth's magnetic field. These journeys are exhausting and dangerous, yet they allow birds to find food and suitable weather throughout the year. Remarkably, some young birds complete the route alone, without ever having flown it before.", qs: [
    ["What is the passage mainly about?", ["How and why birds migrate", "How birds build nests", "Why some birds cannot fly", "How to feed birds in winter"], "הקטע עוסק באופן ובסיבות של נדידת הציפורים."],
    ["What do scientists think birds use to navigate?", ["The Sun, the stars, and the Earth's magnetic field", "Road signs", "Other animals", "Ocean currents"], "נכתב: 'navigate using the Sun, the stars, and even the Earth's magnetic field'."],
    ["Why do birds migrate despite the dangers?", ["To find food and suitable weather throughout the year", "To avoid flying", "To stay in one place", "To grow larger wings"], "נכתב: 'allow birds to find food and suitable weather throughout the year'."],
    ["What does the last sentence suggest about navigation?", ["It is partly instinctive, not only learned", "It must always be taught by parents", "It depends only on maps", "It is impossible for young birds"], "אם ציפורים צעירות עפות לבד בלי ניסיון, היכולת חלקית מולדת."],
    ["The word 'exhausting' means:", ["very tiring", "very easy", "very short", "very safe"], "exhausting = מתיש, מעייף מאוד."],
  ] },
  { lv: 9, diff: 5, passage: "The rise of automation has sparked intense debate about the future of work. Optimists argue that, as in past technological revolutions, machines will eliminate some jobs while creating new ones we cannot yet imagine. Pessimists counter that today's machines are different, capable of performing not only manual tasks but cognitive ones as well. What both sides agree on is that workers will need to adapt, learning new skills throughout their lives.", qs: [
    ["What is the main idea of the passage?", ["The debate over how automation will affect the future of work", "How to build a robot", "The history of factories", "Why machines always fail"], "הקטע מציג את הוויכוח על השפעת האוטומציה על עולם העבודה."],
    ["What do optimists argue?", ["Machines will create new jobs as well as destroy some", "Machines will destroy all jobs", "Machines never replace workers", "Automation should be banned"], "נכתב: 'machines will eliminate some jobs while creating new ones'."],
    ["Why do pessimists think today's machines are different?", ["They can perform cognitive tasks, not just manual ones", "They are cheaper to build", "They work more slowly", "They cannot do manual work"], "נכתב: 'capable of performing not only manual tasks but cognitive ones as well'."],
    ["What do both sides agree on?", ["Workers will need to keep learning new skills", "Automation has no effect on work", "All new jobs are imaginary", "Machines will soon stop improving"], "נכתב: 'both sides agree... workers will need to adapt, learning new skills'."],
    ["The word 'adapt' means:", ["to adjust to new conditions", "to give up", "to repeat the past", "to slow down"], "adapt = להסתגל, להתאים את עצמך למצב חדש."],
  ] },
  { lv: 10, diff: 5, passage: "The placebo effect is one of the most puzzling phenomena in medicine. Patients who receive a treatment with no active ingredient sometimes report real improvement, simply because they believe they are being helped. Far from being a mere trick, the effect reveals how powerfully expectation can influence the body. Because of it, researchers testing new drugs must compare them against placebos to be sure that any benefit comes from the drug itself.", qs: [
    ["What is the passage mainly about?", ["What the placebo effect is and why it matters in research", "How to design a hospital", "The history of medicine", "Why drugs are expensive"], "הקטע מסביר מהו אפקט הפלצבו ומדוע הוא חשוב למחקר."],
    ["Why do some patients improve after a placebo?", ["Because they believe they are being helped", "Because the placebo contains a strong drug", "Because they are not really ill", "Because they exercise more"], "נכתב: 'simply because they believe they are being helped'."],
    ["Why must researchers compare new drugs to placebos?", ["To be sure any benefit comes from the drug itself", "To make the study cheaper", "To avoid testing patients", "To speed up production"], "נכתב: 'to be sure that any benefit comes from the drug itself'."],
    ["What does the placebo effect reveal, according to the passage?", ["That expectation can strongly influence the body", "That medicine never works", "That patients always pretend", "That drugs are unnecessary"], "נכתב: 'reveals how powerfully expectation can influence the body'."],
    ["The word 'phenomena' (singular: phenomenon) means:", ["observed facts or occurrences", "mistakes", "medicines", "doctors"], "phenomenon = תופעה; phenomena היא צורת הרבים."],
  ] },
];

function rotate(arr, by) { const n = arr.length; const r = ((by % n) + n) % n; return arr.slice(n - r).concat(arr.slice(0, n - r)); }

function build(set, unit, track, lang) {
  const items = [];
  set.forEach((blk, bi) => {
    blk.qs.forEach((q, qi) => {
      const [qText, opts, expl] = q; // opts[0] is the correct one as authored
      const by = (bi + qi + 1) % 4; // deterministic rotation per question
      const rotated = rotate(opts.map((o, i) => ({ o, c: i === 0 })), by);
      const labels = lang === "he" ? ["1", "2", "3", "4"] : ["A", "B", "C", "D"];
      let body;
      if (lang === "he") {
        body = `קראו את הקטע וענו על השאלה:\n\n"${blk.passage}"\n\n${qText}`;
      } else {
        const inline = rotated.map((r, i) => `(${labels[i]}) ${r.o}`).join("  ");
        body = `Read the passage and answer the question:\n\n"${blk.passage}"\n\n${qText}\n\n${inline}`;
      }
      items.push({
        track, unit, level_position: blk.lv, difficulty: blk.diff,
        body, explanation: expl, source: "original",
        options: rotated.map((r, i) => ({ label: labels[i], body: r.o, is_correct: r.c, position: i })),
      });
    });
  });
  return items;
}

const he = build(HE, "מילולי – הבנת הנקרא", "psychometric", "he");
const en = build(EN, "אנגלית – Reading", "psychometric", "en");
writeFileSync(HE_OUT, JSON.stringify(he, null, 2) + "\n", "utf8");
writeFileSync(EN_OUT, JSON.stringify(en, null, 2) + "\n", "utf8");
console.log(`Wrote ${he.length} Hebrew + ${en.length} English reading question(s).`);
