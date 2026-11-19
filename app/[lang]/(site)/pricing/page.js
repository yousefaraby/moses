import PackagePicker from '@/components/PackagePicker';
import { PageHead, SectionHead } from '@/components/ui/bits';
import { getDb } from '@/lib/db';
import { getContent } from '@/lib/content';
import { fmt } from '@/lib/dict';
import { formatDuration, formatMoney, formatNumber, formatTime, getDict, tr, weekdayName } from '@/lib/i18n';

export async function generateMetadata({ params }) {
  const { lang } = await params;
  return { title: getDict(lang).pricing.title };
}

export default async function PricingPage({ params }) {
  const { lang } = await params;
  const t = getDict(lang);
  const c = await getContent();
  const db = await getDb();
  const cur = c.settings.currency;
  const q = c.settings.booking.quiet;
  const promos = (db.promos || []).filter((p) => p.active && !p.customerId);
  const days =
    q.days.length > 1
      ? `${weekdayName(q.days[0], lang)}–${weekdayName(q.days[q.days.length - 1], lang)}`
      : weekdayName(q.days[0], lang);

  return (
    <>
      <PageHead title={t.pricing.title} intro={t.pricing.intro} />
      <section className="section">
        <div className="container">
          <PackagePicker lang={lang} t={t} packages={c.packages} sizes={c.vehicleSizes} currency={cur} headingLevel={2} />
        </div>
      </section>

      <section className="section is-flush" aria-labelledby="matrix-title">
        <div className="container">
          <SectionHead id="matrix-title" title={t.pricing.compare} />
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th scope="col">{t.pricing.feature}</th>
                  {c.vehicleSizes.map((s) => (
                    <th key={s.id} scope="col">
                      {tr(s.name, lang)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {c.packages.map((p) => (
                  <tr key={p.id}>
                    <th scope="row">
                      <strong>{tr(p.name, lang)}</strong>
                      <span className="small muted block">{tr(p.tagline, lang)}</span>
                    </th>
                    {c.vehicleSizes.map((s) => (
                      <td key={s.id}>
                        <strong className="num">{formatMoney(p.prices[s.id], lang, cur)}</strong>
                        <span className="small muted block">{formatDuration(p.durations[s.id], lang)}</span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="addons-price-title">
        <div className="container">
          <SectionHead id="addons-price-title" title={t.pricing.addons} />
          <ul className="addon-table">
            {c.addons.map((a) => (
              <li key={a.id} className="addon-row">
                <div>
                  <h3 className="addon-name">{tr(a.name, lang)}</h3>
                  <p className="small muted">{tr(a.description, lang)}</p>
                </div>
                <span className="small muted addon-time">{formatDuration(a.duration, lang)}</span>
                <strong className="num addon-price">{formatMoney(a.price, lang, cur)}</strong>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section services-band" aria-labelledby="offers-title">
        <div className="container">
          <SectionHead id="offers-title" title={t.pricing.offers} />
          <div className="offers">
            <div className="offer offer-quiet">
              <div className="mist" aria-hidden="true">
                <i />
                <i />
                <i />
              </div>
              <h3 className="h2">{t.pricing.quietTitle}</h3>
              <p className="offer-pct num">−{formatNumber(q.percent, lang)}%</p>
              <p className="lead">
                {fmt(t.pricing.quietText, { days, from: formatTime(q.from, lang), to: formatTime(q.to, lang), pct: formatNumber(q.percent, lang) })}
              </p>
            </div>
            <div className="offer">
              <ul className="promo-list">
                {promos.map((p) => (
                  <li key={p.code}>
                    <code className="promo-code latin">{p.code}</code>
                    <span>{tr(p.description, lang)}</span>
                  </li>
                ))}
              </ul>
              <p className="small muted">{t.pricing.promoText}</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
