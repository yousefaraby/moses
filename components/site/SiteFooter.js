import Link from 'next/link';
import Icon from '../Icon';
import Newsletter from './Newsletter';
import LangSwitch from './LangSwitch';
import { href, tr } from '@/lib/i18n';

export default function SiteFooter({ lang, t, settings }) {
  const f = t.footer;
  const explore = [
    ['services', '/services'],
    ['pricing', '/pricing'],
    ['memberships', '/memberships'],
    ['locations', '/locations'],
    ['about', '/about'],
    ['contact', '/contact'],
  ];
  const help = [
    [f.faq, '/faq'],
    [f.giftCards, '/memberships#gift-cards'],
    [f.careers, '/about#careers'],
    [t.nav.account, '/account'],
  ];
  const legal = [
    [f.terms, '/legal/terms'],
    [f.privacy, '/legal/privacy'],
    [f.cancellation, '/legal/cancellation'],
    [f.designSystem, '/design-system'],
  ];
  const year = new Date().getFullYear();
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <img src="/brand/logo-full.png" alt={tr(settings.brand, 'en')} width="140" height="158" className="footer-logo" />
          <div className="footer-contact">
            <a href={`tel:${settings.phone.replace(/\s/g, '')}`}>
              <Icon name="phone" size={20} />
              <span className="latin">{settings.phone}</span>
            </a>
            <a href={`https://wa.me/${settings.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noreferrer">
              <Icon name="whatsapp" size={20} />
              {t.common.whatsapp}
            </a>
            <a href={`mailto:${settings.email}`}>
              <Icon name="mail" size={20} />
              <span className="latin">{settings.email}</span>
            </a>
          </div>
        </div>
        <nav className="footer-col" aria-label={f.explore}>
          <h2 className="footer-title">{f.explore}</h2>
          {explore.map(([k, p]) => (
            <Link key={k} href={href(lang, p)}>
              {t.nav[k]}
            </Link>
          ))}
        </nav>
        <nav className="footer-col" aria-label={f.help}>
          <h2 className="footer-title">{f.help}</h2>
          {help.map(([label, p]) => (
            <Link key={p} href={href(lang, p)}>
              {label}
            </Link>
          ))}
        </nav>
        <nav className="footer-col" aria-label={f.legal}>
          <h2 className="footer-title">{f.legal}</h2>
          {legal.map(([label, p]) => (
            <Link key={p} href={href(lang, p)}>
              {label}
            </Link>
          ))}
        </nav>
        <div className="footer-news">
          <Newsletter t={f} />
          <div className="footer-social" aria-label={f.social}>
            {[
              ['instagram', settings.social.instagram, 'Instagram'],
              ['facebook', settings.social.facebook, 'Facebook'],
              ['tiktok', settings.social.tiktok, 'TikTok'],
            ].map(([icon, url, name]) =>
              url ? (
                <a key={icon} href={url} target="_blank" rel="noreferrer" className="btn btn-quiet btn-icon" aria-label={name}>
                  <Icon name={icon} size={22} />
                </a>
              ) : null
            )}
          </div>
        </div>
      </div>
      <div className="container footer-base">
        <p className="small muted">
          © {year} {tr(settings.brand, lang)}. {f.rights}
        </p>
        <div className="row">
          <LangSwitch lang={lang} label={t.lang.switchLabel} text={t.lang.switchTo} />
          <Link href={href(lang, '/admin')} className="small muted footer-admin">
            {f.admin}
          </Link>
        </div>
      </div>
    </footer>
  );
}
