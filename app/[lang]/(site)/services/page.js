import Link from 'next/link';
import Icon from '@/components/Icon';
import CarArt from '@/components/CarArt';
import { PageHead, SectionHead } from '@/components/ui/bits';
import { getContent } from '@/lib/content';
import { fmt } from '@/lib/dict';
import { formatDuration, formatMoney, getDict, href, tr } from '@/lib/i18n';

export async function generateMetadata({ params }) {
  const { lang } = await params;
  return { title: getDict(lang).services.title };
}

const ART = {
  exterior: { variant: 'sedan', tone: 'pearl' },
  interior: { variant: 'suv', tone: 'graphite' },
  detailing: { variant: 'suv', tone: 'copper' },
  polish: { variant: 'sedan', tone: 'copper' },
  engine: { variant: 'van', tone: 'graphite' },
};

export default async function ServicesPage({ params }) {
  const { lang } = await params;
  const t = getDict(lang);
  const c = await getContent();
  const cur = c.settings.currency;

  const meta = (s) => {
    if (s.bookWith?.packageId) {
      const p = c.packages.find((x) => x.id === s.bookWith.packageId);
      if (!p) return null;
      return {
        price: Math.min(...Object.values(p.prices)),
        time: Math.min(...Object.values(p.durations)),
        link: `/book?package=${p.id}`,
        via: tr(p.name, lang),
      };
    }
    const a = c.addons.find((x) => x.id === s.bookWith?.addonId);
    if (!a) return null;
    return { price: a.price, time: a.duration, link: `/book?addon=${a.id}`, via: tr(a.name, lang) };
  };

  return (
    <>
      <PageHead title={t.services.title} intro={t.services.intro} />
      <section className="section">
        <div className="container svc-list">
          {c.services.map((s, i) => {
            const m = meta(s);
            const art = ART[s.art] || ART.exterior;
            return (
              <article key={s.id} id={s.id} className={`svc-block ${i % 2 ? 'is-flipped' : ''}`}>
                <div className="svc-art">
                  <CarArt variant={art.variant} tone={art.tone} uid={`svc-${s.id}`} />
                </div>
                <div className="svc-body">
                  <h2 className="h2">{tr(s.name, lang)}</h2>
                  <p className="lead">{tr(s.description, lang)}</p>
                  <ul className="pkg-list">
                    {s.includes.map((inc, k) => (
                      <li key={k}>
                        <Icon name="check" size={18} />
                        {tr(inc, lang)}
                      </li>
                    ))}
                  </ul>
                  {m && (
                    <div className="svc-meta">
                      <p>
                        <span className="svc-from small muted">{t.common.from}</span>
                        <strong className="copper svc-price num">{formatMoney(m.price, lang, cur)}</strong>
                      </p>
                      <p className="small muted">
                        <Icon name="clock" size={16} /> {formatDuration(m.time, lang)} · {m.via}
                      </p>
                      <Link href={href(lang, m.link)} className="btn btn-primary">
                        {t.services.bookWith}
                        <Icon name="arrow" size={18} className="flip" />
                      </Link>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="section services-band" aria-labelledby="addons-title">
        <div className="container">
          <SectionHead id="addons-title" title={t.services.addonsTitle} intro={t.services.addonsIntro} />
          <ul className="addon-table">
            {c.addons.map((a) => (
              <li key={a.id} className="addon-row">
                <div>
                  <h3 className="addon-name">{tr(a.name, lang)}</h3>
                  <p className="small muted">{tr(a.description, lang)}</p>
                  {a.includedIn?.length > 0 && (
                    <p className="small copper">
                      {fmt(t.services.includedIn, {
                        name: a.includedIn.map((id) => tr(c.packages.find((p) => p.id === id)?.name, lang)).join(', '),
                      })}
                    </p>
                  )}
                </div>
                <span className="small muted addon-time">{formatDuration(a.duration, lang)}</span>
                <strong className="num addon-price">{formatMoney(a.price, lang, cur)}</strong>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
