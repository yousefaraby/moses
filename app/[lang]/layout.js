import { notFound } from 'next/navigation';
import { dirOf, isLocale, LOCALES, tr } from '@/lib/i18n';
import { getContent } from '@/lib/content';
import '../globals.css';
import '../ui.css';
import '../site.css';
import '../book.css';
import '../admin.css';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const { settings, home } = await getContent();
  const brand = tr(settings.brand, lang);
  return {
    title: { default: `${brand} — ${tr(settings.tagline, lang)}`, template: `%s · ${brand}` },
    description: tr(home.heroText, lang),
    icons: { icon: '/icon.svg' },
    alternates: { languages: Object.fromEntries(LOCALES.map((l) => [l, `/${l}`])) },
  };
}

export const viewport = {
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default async function RootLayout({ children, params }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return (
    <html lang={lang} dir={dirOf(lang)}>
      <head>
        <link rel="preload" href={lang === 'ar' ? '/fonts/readex-pro-arabic-wght-normal.woff2' : '/fonts/kanit-latin-800-italic.woff2'} as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/readex-pro-latin-wght-normal.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
      </head>
      <body>{children}</body>
    </html>
  );
}
