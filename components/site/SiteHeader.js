'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import Icon from '../Icon';
import Logo from './Logo';
import LangSwitch from './LangSwitch';
import { href } from '@/lib/i18n';

export const NAV = [
  ['services', '/services'],
  ['pricing', '/pricing'],
  ['memberships', '/memberships'],
  ['locations', '/locations'],
  ['about', '/about'],
  ['contact', '/contact'],
];

export default function SiteHeader({ lang, t, brand, phone, whatsapp, loggedIn }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return undefined;
    document.documentElement.classList.add('menu-open');
    const first = menuRef.current?.querySelector('a, button');
    first?.focus();
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.documentElement.classList.remove('menu-open');
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const isActive = (path) => pathname === href(lang, path) || pathname.startsWith(`${href(lang, path)}/`);

  return (
    <header className="site-header" data-scrolled={scrolled || open ? 'true' : 'false'}>
      <div className="container header-inner">
        <Logo lang={lang} label={brand} />
        <nav className="desktop-nav" aria-label={t.nav.primary}>
          {NAV.map(([key, path]) => (
            <Link key={key} href={href(lang, path)} aria-current={isActive(path) ? 'page' : undefined}>
              {t.nav[key]}
            </Link>
          ))}
        </nav>
        <div className="header-actions">
          <a className="header-phone" href={`tel:${phone.replace(/\s/g, '')}`}>
            <Icon name="phone" size={20} />
            <span className="latin">{phone}</span>
          </a>
          <LangSwitch lang={lang} label={t.lang.switchLabel} text={t.lang.switchTo} className="hide-sm" />
          <Link href={href(lang, '/account')} className="btn btn-quiet btn-sm header-account" aria-current={isActive('/account') ? 'page' : undefined}>
            <Icon name="user" size={20} />
            <span className="hide-md">{loggedIn ? t.nav.account : t.nav.login}</span>
          </Link>
          <Link href={href(lang, '/book')} className="btn btn-primary header-cta">
            {t.nav.book}
            <Icon name="arrow" size={18} className="flip" />
          </Link>
          <button
            ref={buttonRef}
            type="button"
            className="btn btn-quiet btn-icon menu-button"
            aria-expanded={open}
            aria-controls="site-menu"
            aria-label={open ? t.nav.close : t.nav.menu}
            onClick={() => setOpen((v) => !v)}
          >
            <Icon name={open ? 'close' : 'menu'} />
          </button>
        </div>
      </div>

      <div id="site-menu" ref={menuRef} className="menu-sheet" hidden={!open}>
        <div className="mist" aria-hidden="true">
          <i />
          <i />
          <i />
        </div>
        <nav className="container menu-links" aria-label={t.nav.primary}>
          <Link href={href(lang, '/')} aria-current={pathname === href(lang, '/') ? 'page' : undefined}>
            {t.nav.home}
          </Link>
          {NAV.map(([key, path]) => (
            <Link key={key} href={href(lang, path)} aria-current={isActive(path) ? 'page' : undefined}>
              {t.nav[key]}
            </Link>
          ))}
          <Link href={href(lang, '/account')}>{loggedIn ? t.nav.account : t.nav.login}</Link>
        </nav>
        <div className="container menu-foot">
          <LangSwitch lang={lang} label={t.lang.switchLabel} text={t.lang.switchTo} className="btn btn-ghost" />
          <a className="btn btn-ghost" href={`tel:${phone.replace(/\s/g, '')}`}>
            <Icon name="phone" size={20} />
            {t.common.call}
          </a>
          <a className="btn btn-ghost" href={`https://wa.me/${whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noreferrer">
            <Icon name="whatsapp" size={20} />
            {t.common.whatsapp}
          </a>
        </div>
      </div>
    </header>
  );
}
