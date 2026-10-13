// יחידה 3: הפרסונה. "הגדרת הפרסונה היא לב העניין" (המחוון).
// מתחילים ממה שנכתב בהצעה, ומחדדים לבעל תפקיד. המוקש המרכזי מהשנה שעברה:
// לכתוב שם של ארגון במקום בעל תפקיד. הטיפים כאן הם איך מכירים *תפקיד*:
// מודעות דרושים ופרופילים של אנשים דומים מספרים מה הוא עושה ועל מה מודדים אותו.
// client_gender קובע את הלשון בפרומפט לפגישה ובטיוטה, לא את לשון הכיתה.
import { TYPE_REAL, TYPE_REAL_ORG, TYPE_INVENTED } from './shared.js';

export default {
  title: 'מי הלקוח',
  slides: [
    {
      blocks: [
        { type: 'say', html: '<h2>מי הלקוח?</h2><p>בהצעה כתבנו:</p><p class="muted">{{=proposal_client}}</p>' },
        { type: 'trap', title: 'ארגון הוא לא לקוח',
          body: '״משרד הבריאות״ לא מקבל החלטות. <strong>ראש האגף לאיכות</strong> במשרד הבריאות כן. לכל תפקיד יש אינטרסים אחרים: למנהל השיווק ולמנהלת הכספים באותה חברה יש שאלות שונות על אותם נתונים.' },
        { type: 'field', key: 'org', kind: 'text', label: 'שם הארגון', placeholder: 'למשל: המרכז הרפואי שערי צדק' },
        { type: 'field', key: 'client_role', kind: 'text', label: 'התפקיד המדויק',
          help: 'לא ״מנהל״, אלא ״מנהל השיווק הדיגיטלי״. לא ״המורה״, אלא ״רכזת הפדגוגיה של חטיבת הביניים״.' },
        { type: 'field', key: 'client_name', kind: 'text', label: 'שם בעל התפקיד' },
        { type: 'field', key: 'client_gender', kind: 'choice', label: 'בעל התפקיד הוא:', options: ['גבר', 'אישה'] },
      ],
    },
    {
      blocks: [
        { type: 'text', html: '<h2>מה התפקיד הזה עושה באמת</h2>' },
        { type: 'concept', icon: '🔎', title: 'איך מכירים תפקיד',
          body: '<strong>מודעות דרושים</strong> לאותו תפקיד (AllJobs, Drushim, LinkedIn Jobs): מה נדרש ממנו, ועל מה הוא אחראי.<br><strong>פרופילים בלינקדאין</strong> של אנשים בתפקיד דומה: מה הם כותבים שהם עושים.<br><strong>ראיונות וכתבות</strong> עם אנשים בתפקיד: מה מעסיק אותם.' },
        { type: 'when', key: 'client_type', equals: TYPE_REAL, blocks: [
          { type: 'concept', icon: '👤', title: 'אדם אמיתי', body: 'מחפשים אותו בשמו: ראיונות, הרצאות, הודעות לעיתונות של הארגון. כותבים רק מה שמופיע במקור.' },
        ] },
        { type: 'when', key: 'client_type', equals: [TYPE_REAL_ORG, TYPE_INVENTED], blocks: [
          { type: 'concept', icon: '✏️', title: 'אדם מומצא', body: 'שם שנשמע אמיתי במדינה של הנתונים. הוותק, הרקע ומה שמעסיק אותו נבנים לפי אנשים אמיתיים באותו תפקיד.' },
        ] },
        { type: 'field', key: 'role_day', kind: 'textarea', rows: 3,
          label: 'מה בעל התפקיד עושה ביום רגיל? על מה הוא אחראי?' },
        { type: 'field', key: 'success', kind: 'textarea',
          label: 'מה ייחשב הצלחה בתפקיד הזה? על מה מודדים את בעל התפקיד?',
          help: 'למשל: פחות אשפוזים חוזרים · יותר נרשמים · תקציב שנגמר בזמן · פחות תלונות.' },
        { type: 'field', key: 'role_source', kind: 'textarea', rows: 2,
          label: 'מאיפה למדנו את זה?', help: 'קישור למודעה, לפרופיל או לכתבה.' },
      ],
    },
  ],
};
