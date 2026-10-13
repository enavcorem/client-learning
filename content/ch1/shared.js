// ===== מה שכמה יחידות צריכות לדעת =====
// לא קובץ יחידה (אין לו modulePath במניפסט). יושב כאן כדי שהערכים של
// "איזה לקוח" ייכתבו פעם אחת: הם מזינים את בלוקי ה-when, את הפרומפט ואת הטיוטה.

// שלושת סוגי הלקוח (יחידה 2). אסור לשנות את הטקסט אחרי שתלמידות בחרו —
// הוא הערך השמור.
export const TYPE_REAL = 'ארגון ואדם אמיתיים';
export const TYPE_REAL_ORG = 'ארגון אמיתי, דמות מומצאת';
export const TYPE_INVENTED = 'ארגון ודמות מומצאים';
export const CLIENT_TYPES = [TYPE_REAL, TYPE_REAL_ORG, TYPE_INVENTED];
// הארגון קיים באמת: חוקרים אותו, וכל עובדה מגיעה ממקור
export const REAL_ORG = [TYPE_REAL, TYPE_REAL_ORG];

// ״ב״ + שם הארגון, בלי ״בה...״: ״המרכז הרפואי״ ← ״במרכז הרפואי״
export function inOrg(org) {
  const o = String(org || '').trim();
  if (!o) return 'בארגון';
  return 'ב' + (o.startsWith('ה') ? o.slice(1) : o);
}
