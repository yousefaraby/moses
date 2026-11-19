import Link from 'next/link';
import Icon from '@/components/Icon';
import BeforeAfter from '@/components/BeforeAfter';

const FEATURE_ICONS = ['shield', 'bolt2', 'pin'];
import QuickSlot from '@/components/home/QuickSlot';
import HeroLogo from '@/components/home/HeroLogo';
import TopViewCar from '@/components/home/TopViewCar';
import PackagePicker from '@/components/PackagePicker';
import BranchesLive from '@/components/BranchesLive';
import { FaqList, Reviews, SectionHead } from '@/components/ui/bits';
import { getContent } from '@/lib/content';
import { formatDuration, formatMoney, formatNumber, getDict, href, tr } from '@/lib/i18n';
import { zonedNow } from '@/lib/time';

export default async function HomePage({ params }) {
  const { lang } = await params;
  const t = getDict(lang);
  const c = await getContent();
  const { settings, home } = c;
  const now = zonedNow(settings.timezone);
  const cur = settings.currency;
  const labels = { before: t.home.before, after: t.home.after, compare: t.home.compare };
  const heroTitle = tr(home.heroTitle, lang).trim();
  const cut = heroTitle.lastIndexOf(' ');
  const titleMain = cut > 0 ? heroTitle.slice(0, cut) : heroTitle;
  const titleAccent = cut > 0 ? heroTitle.slice(cut + 1) : '';
  const features = home.features?.length ? home.features : t.home.features;
  const avgRating = c.reviews.length ? c.reviews.reduce((sum, r) => sum + Number(r.rating || 0), 0) / c.reviews.length : 0;
  const openDays = new Set(c.branches.flatMap((b) => Object.entries(b.hours).filter(([, h]) => h && !h.closed).map(([d]) => d))).size;
  const featured = c.plans.find((p) => p.featured) || c.plans[0];
  const priceFrom = (svc) => {
    if (svc.bookWith?.packageId) {
      const p = c.packages.find((x) => x.id === svc.bookWith.packageId);
      return p ? { amount: Math.min(...Object.values(p.prices)), duration: Math.min(...Object.values(p.durations)) } : null;
    }
    const a = c.addons.find((x) => x.id === svc.bookWith?.addonId);
    return a ? { amount: a.price, duration: a.duration } : null;
  };

  return (
    <>
      <section className="hero">
        <div className="container">
          <div className="hero-panel">
            <div className="hero-glow" aria-hidden="true" />
            <div className="hero-copy">
              <h1 className="display hero-title">
                {titleMain} <span className="accent">{titleAccent}</span>
              </h1>
              <p className="hero-sub">{tr(home.heroSub, lang) || t.home.heroSub}</p>
              <p className="lead">{tr(home.heroText, lang)}</p>
              <div className="row hero-ctas">
                <Link href={href(lang, '/book')} className="btn btn-primary btn-lg is-shining">
                  {t.common.bookNow}
                  <Icon name="arrow" size={20} className="flip" />
                </Link>
                <Link href={href(lang, '/pricing')} className="btn btn-ghost btn-lg">
                  {t.common.viewPrices}
                </Link>
              </div>
            </div>
            <div className="hero-visual">
              <HeroLogo label={`${tr(settings.brand, lang)} — ${tr(settings.tagline, lang)}`} />
            </div>
            <ul className="hero-features">
              {features.map((f, i) => (
                <li key={i}>
                  <Icon name={FEATURE_ICONS[i % FEATURE_ICONS.length]} size={30} strokeWidth={1.6} />
                  <span>
                    <strong>{tr(f.title, lang)}</strong>
                    <span className="small muted block">{tr(f.text, lang)}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div className="hero-quick">
            <QuickSlot lang={lang} t={t} branches={c.branches} sizes={c.vehicleSizes} packages={c.packages} currency={cur} today={now.date} quietPct={settings.booking.quiet.percent} />
          </div>
        </div>
      </section>

      <section className="section about-band" aria-labelledby="about-title">
        <div className="container">
          <div className="about-panel-light">
            <div className="about-copy">
              <h2 id="about-title" className="h1 dash-title">
                <span>
                  {t.home.aboutTitle} <span className="accent">{tr(settings.brand, lang)}</span>
                </span>
              </h2>
              <p className="lead">{tr(c.about.story, lang).split(/\n{2,}/)[0]}</p>
              <dl className="about-stats">
                <div>
                  <dt>{t.home.statBranchesLong}</dt>
                  <dd className="num">{formatNumber(c.branches.length, lang)}</dd>
                </div>
                <div>
                  <dt>{t.home.statRating}</dt>
                  <dd className="num">
                    {avgRating ? avgRating.toLocaleString(lang === 'ar' ? 'ar-EG' : 'en-GB', { maximumFractionDigits: 1, minimumFractionDigits: 1 }) : '—'}
                    <Icon name="star" size={34} className="about-star" />
                  </dd>
                </div>
                <div>
                  <dt>{t.home.statOpen}</dt>
                  <dd className="num">
                    {formatNumber(openDays, lang)}/{formatNumber(7, lang)}
                  </dd>
                </div>
              </dl>
              <div className="row about-ctas">
                <Link href={href(lang, '/book')} className="btn btn-primary btn-lg">
                  {t.common.bookNow}
                  <Icon name="arrow" size={20} className="flip" />
                </Link>
                <a href="#how-title" className="play-link">
                  <Icon name="play" size={40} strokeWidth={1.4} />
                  {t.home.howLink}
                </a>
              </div>
            </div>
            <div className="about-art">
              <TopViewCar />
            </div>
          </div>
        </div>
      </section>

      <section className="section how" id="how" aria-labelledby="how-title">
        <div className="container">
          <SectionHead id="how-title" title={tr(home.howTitle, lang)} />
          <ol className="how-steps">
            {home.howSteps.map((s, i) => (
              <li key={i} className="how-step">
                <span className="how-num num" aria-hidden="true">
                  {formatNumber(i + 1, lang)}
                </span>
                <h3 className="h3">{tr(s.title, lang)}</h3>
                <p className="muted">{tr(s.text, lang)}</p>
              </li>
            ))}
          </ol>
          <div className="how-rail" aria-hidden="true">
            <span className="latin">−78.5°C</span>
            <span className="how-rail-line" />
            <span className="latin">CO₂ ↑</span>
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="pkg-title">
        <div className="container">
          <SectionHead
            id="pkg-title"
            title={tr(home.pricingTitle, lang)}
            action={
              <Link href={href(lang, '/pricing')} className="link">
                {t.home.allPrices}
              </Link>
            }
          />
          <PackagePicker lang={lang} t={t} packages={c.packages} sizes={c.vehicleSizes} currency={cur} />
        </div>
      </section>

      <section className="section services-band" aria-labelledby="svc-title">
        <div className="container">
          <SectionHead
            id="svc-title"
            title={tr(home.servicesTitle, lang)}
            intro={t.home.servicesIntro}
            action={
              <Link href={href(lang, '/services')} className="link">
                {t.home.allServices}
              </Link>
            }
          />
          <ul className="svc-rows">
            {c.services.map((s) => {
              const from = priceFrom(s);
              return (
                <li key={s.id}>
                  <Link href={href(lang, `/services#${s.id}`)} className="svc-row">
                    <span className="svc-row-name">{tr(s.name, lang)}</span>
                    <span className="svc-row-short muted">{tr(s.short, lang)}</span>
                    {from && (
                      <span className="svc-row-meta">
                        <span className="small muted">{formatDuration(from.duration, lang)}</span>
                        <span>
                          <span className="small muted">{t.common.from} </span>
                          <strong className="copper num">{formatMoney(from.amount, lang, cur)}</strong>
                        </span>
                      </span>
                    )}
                    <Icon name="arrow" className="flip svc-row-arrow" />
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <section className="section" aria-labelledby="gal-title">
        <div className="container">
          <SectionHead id="gal-title" title={tr(home.galleryTitle, lang)} intro={t.home.compare} />
        </div>
        <div className="gallery-rail">
          {c.gallery.map((g) => (
            <BeforeAfter key={g.id} variant={g.vehicle} tone={g.tone} labels={labels} uid={`g-${g.id}`} title={tr(g.title, lang)} className="gallery-item" />
          ))}
        </div>
      </section>

      {featured && (
        <section className="section is-flush" aria-labelledby="plan-title">
          <div className="container">
            <div className="plan-band">
              <div className="mist" aria-hidden="true">
                <i />
                <i />
                <i />
              </div>
              <div className="plan-band-text">
                <h2 id="plan-title" className="h2">
                  {tr(featured.name, lang)}
                </h2>
                <p className="lead">{tr(featured.description, lang)}</p>
                <p className="plan-band-price">
                  <strong className="num">{formatMoney(featured.price, lang, cur)}</strong>
                  <span className="muted">{featured.period === 'month' ? t.common.perMonth : ''}</span>
                </p>
              </div>
              <div className="plan-band-actions">
                <Link href={href(lang, '/memberships')} className="btn btn-primary btn-lg">
                  {t.nav.memberships}
                </Link>
                <Link href={href(lang, '/memberships#fleet')} className="link">
                  {t.memberships.fleetTitle}
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="section" aria-labelledby="rev-title">
        <div className="container">
          <SectionHead id="rev-title" title={tr(home.reviewsTitle, lang)} intro={settings.demoNotice ? t.about.reviewSample : undefined} />
        </div>
        <Reviews reviews={c.reviews.slice(0, 6)} lang={lang} t={t} branches={c.branches} />
      </section>

      <section className="section is-flush" aria-labelledby="loc-title">
        <div className="container">
          <SectionHead
            id="loc-title"
            title={tr(home.locationsTitle, lang)}
            action={
              <Link href={href(lang, '/locations')} className="link">
                {t.home.seeBranches}
              </Link>
            }
          />
          <BranchesLive lang={lang} t={t} branches={c.branches} today={now.date} />
        </div>
      </section>

      <section className="section" aria-labelledby="faq-title">
        <div className="container faq-split">
          <SectionHead
            id="faq-title"
            title={t.contact.faq}
            action={
              <Link href={href(lang, '/faq')} className="link">
                {t.common.seeAll}
              </Link>
            }
          />
          <FaqList faqs={c.faqs.slice(0, 5)} lang={lang} />
        </div>
      </section>

      <section className="cta-band" aria-labelledby="cta-title">
        <div className="mist" aria-hidden="true">
          <i />
          <i />
          <i />
        </div>
        <div className="container">
          <div className="cta-inner">
            <h2 id="cta-title" className="display">
              {tr(home.ctaTitle, lang)}
            </h2>
            <p className="lead">{tr(home.ctaText, lang)}</p>
            <Link href={href(lang, '/book')} className="btn btn-dark btn-lg">
              {t.common.bookNow}
              <Icon name="arrow" size={20} className="flip" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
