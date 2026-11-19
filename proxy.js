import { NextResponse } from 'next/server';

const LOCALES = ['ar', 'en'];
const DEFAULT_LOCALE = 'ar';

function pickLocale(request) {
  const saved = request.cookies.get('md_lang')?.value;
  if (LOCALES.includes(saved)) return saved;
  const header = request.headers.get('accept-language') || '';
  const first = header.split(',')[0]?.trim().slice(0, 2).toLowerCase();
  return first === 'en' ? 'en' : DEFAULT_LOCALE;
}

export function proxy(request) {
  const { pathname } = request.nextUrl;
  const hasLocale = LOCALES.some((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`));
  if (hasLocale) return;
  const url = request.nextUrl.clone();
  url.pathname = `/${pickLocale(request)}${pathname === '/' ? '' : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ['/((?!_next|api|fonts|brand|favicon.ico|icon.svg|robots.txt).*)'],
};
