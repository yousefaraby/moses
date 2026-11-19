'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Icon from '../Icon';
import LangSwitch from '../site/LangSwitch';
import { postJson } from '@/lib/client';
import { href } from '@/lib/i18n';

const GROUPS = [
  ['operate', [['dashboard', '', 'chart'], ['bookings', '/bookings', 'calendar'], ['capacity', '/capacity', 'clock'], ['staff', '/staff', 'users'], ['customers', '/customers', 'user']]],
  ['sell', [['catalog', '/catalog', 'layers'], ['memberships', '/memberships', 'card'], ['notifications', '/notifications', 'bell'], ['reports', '/reports', 'chart']]],
  ['site', [['messages', '/messages', 'inbox'], ['content', '/content', 'edit'], ['settings', '/settings', 'settings']]],
];

export default function AdminShell({ lang, t, unread, children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [pathname]);
  const base = href(lang, '/admin');
  const isActive = (p) => (p === '' ? pathname === base : pathname.startsWith(base + p));

  return (
    <div className="admin">
      <header className="admin-top">
        <button type="button" className="btn btn-quiet btn-icon admin-menu-btn" aria-expanded={open} aria-controls="admin-nav" aria-label={t.nav.menu} onClick={() => setOpen((v) => !v)}>
          <Icon name={open ? 'close' : 'menu'} />
        </button>
        <Link href={base} className="admin-brand">
          <img src="/brand/logo-mark.png" alt="" width="40" height="29" />
          <span>{t.admin.title}</span>
        </Link>
        <div className="admin-top-actions">
          <LangSwitch lang={lang} label={t.lang.switchLabel} text={t.lang.switchTo} />
          <Link href={href(lang, '/')} className="btn btn-quiet btn-sm">
            {t.admin.viewSite}
          </Link>
        </div>
      </header>
      <nav id="admin-nav" className={`admin-nav ${open ? 'is-open' : ''}`} aria-label={t.admin.title}>
        {GROUPS.map(([g, items]) => (
          <div key={g} className="admin-nav-group">
            <p className="admin-nav-title">{t.admin.groups[g]}</p>
            {items.map(([key, p, icon]) => (
              <Link key={key} href={base + p} aria-current={isActive(p) ? 'page' : undefined}>
                <Icon name={icon} size={20} />
                <span>{t.admin.nav[key]}</span>
                {key === 'messages' && unread > 0 && <span className="admin-badge">{unread}</span>}
              </Link>
            ))}
          </div>
        ))}
        <button
          type="button"
          className="admin-logout"
          onClick={async () => {
            await postJson('/api/admin/logout', {});
            router.push(href(lang, '/admin/login'));
            router.refresh();
          }}
        >
          <Icon name="logout" size={20} className="flip" />
          {t.admin.logout}
        </button>
      </nav>
      <main className="admin-main" id="main">
        {children}
      </main>
    </div>
  );
}
