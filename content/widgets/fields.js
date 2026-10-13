// ===== הבלוקים של לומדת הלקוח =====
// field        — שדה כתיבה/בחירה שנשמר תוך כדי (במכשיר ובשרת)
// when         — בלוקים שמוצגים רק אם שדה קודם קיבל ערך מסוים (אמיתי/מומצא)
// copy-prompt  — טקסט שנבנה מהתשובות, עם כפתור העתקה (פרומפט לפגישה, לביקורת)
// say          — כמו text, אבל עם {{נקבה|זכר}} ו-{{=key}}
// assemble     — טיוטת חצי העמוד: נבנית מהתשובות, ואחר כך נערכת ונשמרת
//
// לשון: התוכן נכתב ברבים ("כתבו", "בחרו"), שמתאים לבנות ולבנים. מילים
// שכן משתנות נכתבות {{שלכן|שלכם}}, ו-{{=key}} מציג ערך של שדה קודם.

import * as Progress from '../../js/progress.js';
import { renderBlock, renderBlocks } from '../../js/engine/blocks.js';
import { getFlatUnits } from '../manifest.js';
import { getValue, setValue, currentUnitId, ensureFresh, onSaveStatus } from './store.js';

// ===== עזרים =====
export function el(tag, className, html) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (html !== undefined) node.innerHTML = html;
  return node;
}

export function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}

export function gender() {
  const s = Progress.getStudent();
  return (s && s.gender === 'm') ? 'm' : 'f';
}

// {{נקבה|זכר}} לפי לשון הכיתה, {{=key}} לערך של שדה (מוברח).
export function tpl(text) {
  const g = gender();
  return String(text ?? '')
    .replace(/\{\{=([\w-]+)\}\}/g, (_, key) => {
      const v = getValue(key);
      const s = Array.isArray(v) ? v.join(', ') : String(v || '');
      return s ? `<strong>${esc(s)}</strong>` : '<span class="cl-missing">(עוד לא מולא)</span>';
    })
    .replace(/\{\{([^|{}]*)\|([^|{}]*)\}\}/g, (_, f, m) => (g === 'm' ? m : f));
}

const valueListeners = new Set();
function emitValue(key) { valueListeners.forEach((fn) => fn(key)); }

// שינוי ערך: שומרים, ומודיעים לבלוקי when באותו סלייד.
function commit(key, label, value, display) {
  const unitId = currentUnitId();
  if (!unitId) return;
  setValue(unitId, key, label, value, display);
  emitValue(key);
}

// ===== מוכנות: לפני שמאפשרים לכתוב, מושכים מהשרת את מה שנכתב במכשיר אחר =====
// עד 4 שניות. בלי רשת — ממשיכים עם מה שיש במכשיר.
const readyByUnit = new Map();
function ready(unitIds) {
  const id = unitIds.join(',');
  if (!readyByUnit.has(id)) {
    const fresh = ensureFresh(unitIds).catch(() => false);
    const timeout = new Promise((res) => setTimeout(() => res(false), 4000));
    readyByUnit.set(id, Promise.race([fresh, timeout]));
  }
  return readyByUnit.get(id);
}
const allUnitIds = () => getFlatUnits().map((u) => u.id);

// ===== חיווי שמירה — תווית אחת קבועה בפינה =====
let statusEl = null;
let statusTimer = null;
const STATUS_TEXT = {
  saving: 'שומר…',
  saved: 'נשמר ✓',
  offline: 'נשמר במכשיר. יעלה לשרת כשתחזור הרשת',
};
function ensureStatusEl() {
  if (statusEl) return;
  statusEl = el('div', 'cl-save-status');
  statusEl.setAttribute('role', 'status');
  document.body.appendChild(statusEl);
  onSaveStatus((s) => {
    statusEl.textContent = STATUS_TEXT[s] || '';
    statusEl.dataset.state = s;
    statusEl.classList.add('show');
    clearTimeout(statusTimer);
    if (s === 'saved') statusTimer = setTimeout(() => statusEl.classList.remove('show'), 2000);
  });
}

// ===== field =====
function renderField(block) {
  ensureStatusEl();
  const wrap = el('div', 'block cl-field');
  const id = `f-${block.key}`;
  const label = el('label', 'cl-label', tpl(block.label));
  label.htmlFor = id;
  wrap.appendChild(label);
  if (block.help) wrap.appendChild(el('div', 'cl-help', tpl(block.help)));

  const plainLabel = label.textContent;
  const kind = block.kind || 'textarea';
  const current = getValue(block.key);
  let control;

  if (kind === 'choice') {
    control = el('div', 'cl-choices');
    control.setAttribute('role', 'radiogroup');
    (block.options || []).forEach((opt) => {
      const b = el('button', 'cl-choice', esc(opt));
      b.type = 'button';
      b.setAttribute('aria-pressed', String(current === opt));
      b.addEventListener('click', () => {
        control.querySelectorAll('.cl-choice').forEach((x) => x.setAttribute('aria-pressed', 'false'));
        b.setAttribute('aria-pressed', 'true');
        commit(block.key, plainLabel, opt);
      });
      control.appendChild(b);
    });
  } else if (kind === 'checks' || kind === 'pick') {
    // checks: רשימה קבועה (צ'קליסט). pick: צ'יפים מתוך רשימה ששמרו קודם (from).
    control = el('div', kind === 'pick' ? 'cl-chips' : 'cl-checks');
    const chosen = new Set(Array.isArray(current) ? current : []);
    const options = kind === 'pick'
      ? (Array.isArray(getValue(block.from)) ? getValue(block.from) : [])
      : (block.options || []).map(tpl);
    if (kind === 'pick' && !options.length) {
      control.appendChild(el('div', 'cl-missing', block.emptyMsg || 'עוד אין רשימה לבחור ממנה. אפשר לחזור ליחידה הקודמת ולמלא אותה.'));
    }
    options.forEach((opt) => {
      const text = String(opt).replace(/<[^>]+>/g, '');
      const b = el('button', kind === 'pick' ? 'cl-chip' : 'cl-check', kind === 'pick' ? esc(text) : opt);
      b.type = 'button';
      b.setAttribute('aria-pressed', String(chosen.has(text)));
      b.addEventListener('click', () => {
        if (chosen.has(text)) chosen.delete(text); else chosen.add(text);
        b.setAttribute('aria-pressed', String(chosen.has(text)));
        // שומרים לפי סדר האפשרויות, לא לפי סדר הלחיצות
        const ordered = options.map((o) => String(o).replace(/<[^>]+>/g, '')).filter((o) => chosen.has(o));
        commit(block.key, plainLabel, ordered, ordered.join('\n'));
      });
      control.appendChild(b);
    });
  } else {
    const multi = kind === 'textarea' || kind === 'list';
    control = el(multi ? 'textarea' : 'input', 'input-field cl-input');
    if (multi) control.rows = block.rows || (kind === 'list' ? 5 : 3);
    if (kind === 'number') { control.type = 'text'; control.inputMode = 'numeric'; control.dir = 'ltr'; }
    if (block.placeholder) control.placeholder = block.placeholder;
    control.value = Array.isArray(current) ? current.join('\n') : (current || '');

    const warn = el('div', 'cl-warn');
    const check = () => {
      if (kind !== 'number' || block.min === undefined) return;
      const n = Number(String(control.value).replace(/[,\s]/g, ''));
      const show = control.value.trim() !== '' && (!Number.isFinite(n) || n < block.min);
      warn.innerHTML = show ? tpl(block.minMsg || `צריך לפחות ${block.min}`) : '';
    };
    control.addEventListener('input', () => {
      check();
      if (kind === 'list') {
        const items = control.value.split('\n').map((s) => s.trim()).filter(Boolean);
        commit(block.key, plainLabel, items, items.join('\n'));
      } else {
        commit(block.key, plainLabel, control.value);
      }
    });
    check();
    control.id = id;
    wrap.appendChild(control);
    wrap.appendChild(warn);
    lockUntilReady(wrap, control, block);
    return wrap;
  }

  wrap.appendChild(control);
  lockUntilReady(wrap, control, block);
  return wrap;
}

// עד שהבדיקה מול השרת מסתיימת, השדה נעול — אחרת הקלדה מהירה תידרס.
// אם התברר שבשרת יש גרסה חדשה יותר, מציירים את השדה מחדש עם הערך שלה.
const settledUnits = new Set();
function lockUntilReady(wrap, control, block) {
  const unitId = currentUnitId();
  if (!unitId || settledUnits.has(unitId)) return;
  const inputs = control.matches('input,textarea') ? [control] : [...control.querySelectorAll('button')];
  inputs.forEach((x) => { x.disabled = true; });
  wrap.classList.add('cl-loading');
  ready([unitId]).then((changed) => {
    settledUnits.add(unitId);
    if (changed && wrap.isConnected) { wrap.replaceWith(renderField(block)); return; }
    inputs.forEach((x) => { x.disabled = false; });
    wrap.classList.remove('cl-loading');
  });
}

// ===== when =====
// { type: 'when', key: 'client_type', equals: 'אמיתי', blocks: [...] }
function renderWhen(block) {
  const wrap = el('div', 'cl-when');
  const draw = () => {
    const v = getValue(block.key);
    const show = Array.isArray(block.equals) ? block.equals.includes(v) : v === block.equals;
    wrap.innerHTML = '';
    wrap.hidden = !show;
    if (show) wrap.appendChild(renderBlocks(block.blocks));
  };
  const listener = (key) => {
    if (!wrap.isConnected) { valueListeners.delete(listener); return; }
    if (key === block.key) draw();
  };
  valueListeners.add(listener);
  draw();
  if (!getValue(block.key)) {
    // ייתכן שהערך מגיע מהשרת רק עוד רגע
    ready(allUnitIds()).then(() => { if (wrap.isConnected) draw(); });
  }
  return wrap;
}

// ===== copy-prompt =====
// { type: 'copy-prompt', title, intro, build: (v, g) => string, button }
// v(key) מחזיר ערך כטקסט (רשימה מחוברת בפסיקים), או '' אם לא מולא.
function valueText(key) {
  const v = getValue(key);
  return Array.isArray(v) ? v.join(', ') : String(v || '').trim();
}

async function copyText(text, btn, doneLabel) {
  const original = btn.textContent;
  let ok = false;
  try { await navigator.clipboard.writeText(text); ok = true; } catch (e) { ok = false; }
  btn.textContent = ok ? doneLabel : 'לא הצליח להעתיק. אפשר לסמן את הטקסט ולהעתיק ידנית';
  setTimeout(() => { btn.textContent = original; }, 2500);
  return ok;
}

function renderCopyPrompt(block) {
  const wrap = el('div', 'block cl-prompt');
  if (block.title) wrap.appendChild(el('div', 'cl-label', tpl(block.title)));
  if (block.intro) wrap.appendChild(el('div', 'cl-help', tpl(block.intro)));
  const area = el('textarea', 'input-field cl-prompt-text');
  area.readOnly = true;
  area.rows = block.rows || 8;
  area.value = 'טוען…';
  const btn = el('button', 'btn btn-primary btn-block', esc(block.button || 'העתקה'));
  btn.type = 'button';
  const missing = el('div', 'cl-warn');
  wrap.append(area, missing, btn);

  const build = () => {
    area.value = block.build(valueText, gender());
    const need = (block.needs || []).filter((k) => !valueText(k));
    missing.textContent = need.length ? 'חלק מהפרטים עוד לא מולאו ביחידות הקודמות, ולכן הטקסט חסר. אפשר להעתיק בכל זאת, אבל עדיף להשלים קודם.' : '';
  };
  ready(allUnitIds()).then(build);
  btn.addEventListener('click', () => copyText(area.value, btn, 'הועתק ✓ עכשיו להדביק בצ\'אט'));
  return wrap;
}

// ===== assemble =====
// { type: 'assemble', key: 'draft', label, build: (v, g) => string, target: [150, 230] }
// בכניסה הראשונה הטיוטה נבנית מהתשובות. משם היא שלהן: נשמרת כמו כל שדה,
// ולא נדרסת. "לבנות מחדש" רק בלחיצה ואחרי אישור.
function countWords(s) {
  return String(s || '').trim().split(/\s+/).filter(Boolean).length;
}

function renderAssemble(block) {
  ensureStatusEl();
  const wrap = el('div', 'block cl-field cl-assemble');
  wrap.appendChild(el('label', 'cl-label', tpl(block.label)));
  if (block.help) wrap.appendChild(el('div', 'cl-help', tpl(block.help)));
  const area = el('textarea', 'input-field cl-input cl-draft');
  area.rows = block.rows || 14;
  area.disabled = true;
  area.value = 'טוען…';
  const meter = el('div', 'cl-meter');
  const tools = el('div', 'cl-tools');
  const copyBtn = el('button', 'btn btn-primary', 'העתקה לוורד');
  copyBtn.type = 'button';
  const rebuildBtn = el('button', 'btn btn-ghost', 'לבנות מחדש מהתשובות');
  rebuildBtn.type = 'button';
  tools.append(copyBtn, rebuildBtn);
  wrap.append(area, meter, tools);

  const [lo, hi] = block.target || [150, 230];
  const updateMeter = () => {
    const n = countWords(area.value);
    let note = 'באורך הנכון לחצי עמוד';
    let state = 'ok';
    if (n < lo) { note = 'קצר מחצי עמוד. כנראה חסר רקע או מטרה'; state = 'low'; }
    if (n > hi) { note = 'ארוך מחצי עמוד. מה אפשר להוריד?'; state = 'high'; }
    meter.textContent = `${n} מילים · ${note}`;
    meter.dataset.state = state;
  };
  const save = () => commit(block.key, 'חצי העמוד', area.value);

  ready(allUnitIds()).then(() => {
    const saved = getValue(block.key);
    area.value = saved || block.build(valueText, gender());
    if (!saved) save();
    area.disabled = false;
    updateMeter();
  });
  area.addEventListener('input', () => { updateMeter(); save(); });
  copyBtn.addEventListener('click', () => copyText(area.value, copyBtn, 'הועתק ✓'));
  rebuildBtn.addEventListener('click', () => {
    if (!confirm('לבנות את הטיוטה מחדש מהתשובות? מה שנערך כאן יימחק.')) return;
    area.value = block.build(valueText, gender());
    updateMeter();
    save();
  });
  return wrap;
}

// ===== say =====
function renderSay(block) {
  return renderBlock({ type: 'text', html: tpl(block.html) });
}

export const BLOCKS = {
  say: renderSay,
  field: renderField,
  when: renderWhen,
  'copy-prompt': renderCopyPrompt,
  assemble: renderAssemble,
};
