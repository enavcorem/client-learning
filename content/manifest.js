// ===== מקור האמת היחיד למבנה הקורס =====
// כל פרק ויחידה מוגדרים כאן פעם אחת. גם מפת המסלול וגם לוגיקת הנעילה
// קוראות מהרשימה הזאת בלבד. להוספת יחידה: אובייקט חדש ל-units + קובץ
// תוכן תחת content/chX/. אין צורך לגעת בשום קובץ אחר.

// ⚠️ מזהה הקורס. ממנו נגזרים מפתחות ה-localStorage של התלמידות
// ('client_data_v3' ו-'client_current_key_v3'). שינוי הערך כאן
// אחרי שתלמידות כבר נכנסו = התקדמות שנראית להן כאילו נמחקה.
export const COURSE_ID = 'client';

export const COURSE = {
  title: 'הלקוח שלנו',
  icon: '🤝',
  // כל רשומה היא של זוג, ולכן הברכה ברבים
  welcome: {
    f: 'ברוכות הבאות! נכיר את הלקוח 🤝',
    m: 'ברוכים הבאים! נכיר את הלקוח 🤝',
  },
  finaleText: 'חצי העמוד מוכן להעתקה לוורד 🤝',
  teacherTitle: '🤝 לוח מורה — הלקוח שלנו',
};

// פרק אחד, שמונה יחידות קצרות. כל יחידה היא צעד, ולכן לוח המורה מראה
// "מי מילאה כמה" (x/8) בלי שום תוספת. הסדר נעול בכוונה: הטיוטה בסוף
// נבנית ממה שנכתב בכל הצעדים שלפניה.
export const CHAPTERS = [
  {
    id: 'client-ch1',
    number: 1,
    title: 'הלקוח והמטרה (פרק 1 בעבודה הכתובה)',
    icon: '🤝',
    colorVar: 'chapter-1',
    units: [
      { id: 'client-ch1-u1', title: 'מה כבר יש לנו', type: 'lesson', icon: '🗂️', estMinutes: 8, modulePath: 'ch1/ch1-u1-proposal.js' },
      { id: 'client-ch1-u2', title: 'איזה לקוח?', type: 'lesson', icon: '🎭', estMinutes: 5, modulePath: 'ch1/ch1-u2-client-type.js' },
      { id: 'client-ch1-u3', title: 'מי הלקוח', type: 'lesson', icon: '🧑‍💼', estMinutes: 8, modulePath: 'ch1/ch1-u3-persona.js' },
      { id: 'client-ch1-u4', title: 'הארגון', type: 'lesson', icon: '🏢', estMinutes: 15, modulePath: 'ch1/ch1-u4-organization.js' },
      { id: 'client-ch1-u5', title: 'הסביבה', type: 'lesson', icon: '🏙️', estMinutes: 15, modulePath: 'ch1/ch1-u5-environment.js' },
      { id: 'client-ch1-u6', title: 'פגישה עם הלקוח', type: 'lesson', icon: '☕', estMinutes: 15, modulePath: 'ch1/ch1-u6-meeting.js' },
      { id: 'client-ch1-u7', title: 'המטרה האנליטית', type: 'lesson', icon: '🎯', estMinutes: 10, modulePath: 'ch1/ch1-u7-goal.js' },
      { id: 'client-ch1-u8', title: 'חצי העמוד', type: 'lesson', icon: '📝', estMinutes: 15, modulePath: 'ch1/ch1-u8-half-page.js' },
    ],
  },
];

// ===== עזרי מניפסט =====
// לוגיקה גנרית שלא תלויה בקורס. המנוע מייבא את הפונקציות האלה מהמניפסט,
// ולכן הן חייבות להיות מיוצאות מכאן בכל לומדה. new-course.mjs מוסיף אותן
// אוטומטית — אין צורך לכתוב או לערוך אותן ביד.

export function getFlatUnits() {
  const flat = [];
  CHAPTERS.forEach(ch => {
    ch.units.forEach(u => {
      flat.push({ ...u, chapterId: ch.id, chapterNumber: ch.number, chapterTitle: ch.title, colorVar: ch.colorVar });
    });
  });
  return flat;
}

export function findUnit(unitId) {
  return getFlatUnits().find(u => u.id === unitId) || null;
}

export function findChapter(chapterId) {
  return CHAPTERS.find(ch => ch.id === chapterId) || null;
}

// היחידה שבאה מיד אחרי unitId ברצף הכולל (לא לפי שם, לפי הסדר במניפסט) —
// null אם זו היחידה האחרונה בקורס (המבחן המסכם).
export function getNextUnit(unitId) {
  const flat = getFlatUnits();
  const idx = flat.findIndex(u => u.id === unitId);
  if (idx === -1 || idx === flat.length - 1) return null;
  return flat[idx + 1];
}

// הפרק שבא מיד אחרי chapterId — null אם זה הפרק האחרון.
export function getNextChapter(chapterId) {
  const idx = CHAPTERS.findIndex(ch => ch.id === chapterId);
  if (idx === -1 || idx === CHAPTERS.length - 1) return null;
  return CHAPTERS[idx + 1];
}
