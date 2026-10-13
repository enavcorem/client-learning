// המנוע מייבא את הקובץ הזה תמיד — גם אם הוא ריק. אל תמחקי אותו.
//
// לומדת הלקוח היא לומדת כתיבה: אין בה שאלות עם תשובה נכונה, אלא שדות
// שנשמרים (fields.js + store.js) ונאספים בסוף לחצי עמוד.
// העיצוב שלהם ב-client.css, שנטען מ-index.html.

import { registerBlockRenderer } from '../../js/engine/blocks.js';
import { BLOCKS } from './fields.js';

Object.entries(BLOCKS).forEach(([type, fn]) => registerBlockRenderer(type, fn));
