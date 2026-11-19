import Link from 'next/link';
import { href } from '@/lib/i18n';

export default function Logo({ lang, label }) {
  return (
    <Link href={href(lang, '/')} className="logo" aria-label={label}>
      <img src="/brand/logo-mark.png" alt="" width="58" height="42" className="logo-mark" />
      <span className="logo-word latin" aria-hidden="true">
        <span>Moses</span>
        <span>Detailing</span>
      </span>
    </Link>
  );
}
