'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Icon from '../Icon';

export function switchPath(pathname, to) {
  const parts = (pathname || '/').split('/');
  parts[1] = to;
  return parts.join('/') || `/${to}`;
}

export default function LangSwitch({ lang, label, text, className = '' }) {
  const pathname = usePathname();
  const to = lang === 'ar' ? 'en' : 'ar';
  return (
    <Link
      href={switchPath(pathname, to)}
      hrefLang={to}
      lang={to}
      className={`lang-switch ${className}`}
      aria-label={label}
      onClick={() => {
        document.cookie = `md_lang=${to};path=/;max-age=31536000;samesite=lax`;
      }}
    >
      <Icon name="globe" size={20} />
      <span>{text}</span>
    </Link>
  );
}
