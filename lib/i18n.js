import { dict } from './dict';

export const LOCALES = ['ar', 'en'];
export const DEFAULT_LOCALE = 'ar';

export function isLocale(value) {
  return LOCALES.includes(value);
}

export function dirOf(lang) {
  return lang === 'ar' ? 'rtl' : 'ltr';
}

export function otherLocale(lang) {
  return lang === 'ar' ? 'en' : 'ar';
}

export function getDict(lang) {
  return dict[isLocale(lang) ? lang : DEFAULT_LOCALE];
}

/** Pick the right language from a bilingual field ({ ar, en }) or pass a string through. */
export function tr(value, lang) {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  return value[lang] ?? value.en ?? value.ar ?? '';
}

const intlLocale = (lang) => (lang === 'ar' ? 'ar-EG' : 'en-GB');

export function formatNumber(n, lang) {
  return new Intl.NumberFormat(intlLocale(lang), { maximumFractionDigits: 0 }).format(Number(n) || 0);
}

export function formatMoney(n, lang, currency = { ar: 'ج.م', en: 'EGP' }) {
  return `${formatNumber(n, lang)} ${tr(currency, lang)}`;
}

export function formatTime(hhmm, lang) {
  if (!hhmm) return '';
  const [h, m] = hhmm.split(':').map(Number);
  const d = new Date(Date.UTC(2026, 0, 1, h, m));
  return new Intl.DateTimeFormat(intlLocale(lang), { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'UTC' }).format(d);
}

export function formatDate(date, lang, opts = { weekday: 'short', day: 'numeric', month: 'short' }) {
  if (!date) return '';
  const [y, m, d] = date.split('-').map(Number);
  return new Intl.DateTimeFormat(intlLocale(lang), { ...opts, timeZone: 'UTC' }).format(new Date(Date.UTC(y, m - 1, d)));
}

export function formatDateTime(iso, lang) {
  if (!iso) return '';
  return new Intl.DateTimeFormat(intlLocale(lang), {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'Africa/Cairo',
  }).format(new Date(iso));
}

export function formatDuration(minutes, lang) {
  const m = Number(minutes) || 0;
  const h = Math.floor(m / 60);
  const r = m % 60;
  const t = getDict(lang).units;
  if (!h) return `${formatNumber(r, lang)} ${t.min}`;
  if (!r) return `${formatNumber(h, lang)} ${t.hr}`;
  return `${formatNumber(h, lang)} ${t.hr} ${formatNumber(r, lang)} ${t.min}`;
}

export function weekdayName(index, lang, style = 'long') {
  // 2026-01-04 is a Sunday.
  const d = new Date(Date.UTC(2026, 0, 4 + index));
  return new Intl.DateTimeFormat(intlLocale(lang), { weekday: style, timeZone: 'UTC' }).format(d);
}

/** Build a localized path: href(lang, '/book') → '/ar/book'. */
export function href(lang, path = '/') {
  const clean = path.startsWith('/') ? path : `/${path}`;
  return clean === '/' ? `/${lang}` : `/${lang}${clean}`;
}
