'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Icon from '../Icon';
import { href } from '@/lib/i18n';

export default function MobileBar({ lang, t, fromPrice }) {
  const pathname = usePathname();
  if (pathname.startsWith(href(lang, '/book'))) return null;
  const items = [
    ['home', '/', 'home'],
    ['services', '/services', 'sparkle'],
    null,
    ['locations', '/locations', 'pin'],
    ['account', '/account', 'user'],
  ];
  const active = (path) => (path === '/' ? pathname === href(lang, '/') : pathname.startsWith(href(lang, path)));
  return (
    <nav className="mobile-bar" aria-label={t.nav.mobileBar}>
      {items.map((item) =>
        item ? (
          <Link key={item[0]} href={href(lang, item[1])} className="mobile-bar-item" aria-current={active(item[1]) ? 'page' : undefined}>
            <Icon name={item[2]} size={22} />
            <span>{t.nav[item[0]]}</span>
          </Link>
        ) : (
          <Link key="book" href={href(lang, '/book')} className="mobile-bar-book" aria-label={`${t.nav.book} · ${t.sticky.from} ${fromPrice}`}>
            <span className="mobile-bar-book-icon">
              <Icon name="calendar" size={24} strokeWidth={2} />
            </span>
            <span>{t.sticky.label}</span>
          </Link>
        )
      )}
    </nav>
  );
}
