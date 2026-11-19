import Icon from '@/components/Icon';
import { PageHead, SectionHead } from '@/components/ui/bits';
import { getContent } from '@/lib/content';
import { getDict, formatNumber, tr } from '@/lib/i18n';

export async function generateMetadata({ params }) {
  const { lang } = await params;
  return { title: getDict(lang).system.title };
}

const COLORS = [
  ['Orange', '#F5922F', 'Primary · Book Now, prices, active states'],
  ['Graphite', '#15171A', 'Panels · hero, cards, header on scroll'],
  ['Night', '#0B0C0E', 'Page background'],
  ['White', '#FFFFFF', 'Text & icons'],
  ['Paper', '#F4F3F3', 'Light panels (About)'],
  ['Orange hover', '#FFA64D', 'Hover'],
  ['Orange pressed', '#D9781A', 'Pressed'],
  ['Border', '#26292E', 'Lines'],
  ['Muted', '#A9ADB4', 'Secondary text'],
  ['Frost', '#E6EEF2', 'Water spray'],
];
const RADII = [
  ['none', 0],
  ['xs', 4],
  ['sm', 8],
  ['md', 12],
  ['lg', 20],
  ['xl', 32],
  ['pill', 999],
];

export default async function DesignSystemPage({ params }) {
  const { lang } = await params;
  const t = getDict(lang);
  const s = t.system;
  const c = await getContent();
  const brief = c.brief;
  const sitemap = [
    [t.nav.services, ['Exterior', 'Interior', 'Detailing', 'Polish & ceramic', 'Engine bay', 'Add-ons']],
    [t.nav.pricing, ['Package comparison', 'Price by car size', 'Add-on prices', 'Offers & promos']],
    [t.nav.memberships, ['Monthly', 'Bundles', 'Fleet & corporate', 'Gift cards']],
    [t.nav.book, ['Wizard', 'Payment', 'Confirmation + QR', 'Reschedule / cancel']],
    [t.nav.locations, ['Branch list', 'Map', 'Hours', 'Live wait']],
    [t.nav.about, ['Story', 'Before / after', 'Reviews', 'Eco', 'Careers']],
    [t.nav.contact, ['Form', 'WhatsApp & call', 'FAQ', 'Business']],
    [t.nav.account, ['Login', 'Bookings', 'Cars', 'Points', 'Invoices']],
  ];
  const adminModules = Object.values(t.admin.nav);

  return (
    <>
      <PageHead title={s.title} intro={s.intro} />

      <section className="section" aria-labelledby="ds-goals">
        <div className="container">
          <SectionHead id="ds-goals" title={s.goals} />
          <div className="ds-cols">
            {brief.goals.map((g, i) => (
              <div key={i} className="ds-item">
                <h3 className="h3">{tr(g.title, lang)}</h3>
                <p className="muted">{tr(g.text, lang)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section is-flush" aria-labelledby="ds-users">
        <div className="container">
          <SectionHead id="ds-users" title={s.users} />
          <div className="ds-cols four">
            {brief.audiences.map((g, i) => (
              <div key={i} className="ds-item">
                <h3 className="h3">{tr(g.title, lang)}</h3>
                <p className="muted">{tr(g.text, lang)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="ds-moscow">
        <div className="container">
          <SectionHead id="ds-moscow" title={s.priority} />
          <div className="ds-cols four">
            {['must', 'should', 'could', 'wont'].map((k) => (
              <div key={k} className={`ds-item ${k === 'must' ? 'is-must' : ''}`}>
                <h3 className="h3">{s[k]}</h3>
                <ul className="pkg-list">
                  {brief.moscow[k].map((m, i) => (
                    <li key={i}>
                      <Icon name={k === 'wont' ? 'minus' : 'check'} size={18} />
                      {tr(m, lang)}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section services-band" aria-labelledby="ds-sitemap">
        <div className="container">
          <SectionHead id="ds-sitemap" title={s.sitemap} />
          <div className="sitemap">
            <p className="sitemap-root">{t.nav.home}</p>
            <ul className="sitemap-grid">
              {sitemap.map(([name, kids]) => (
                <li key={name}>
                  <strong>{name}</strong>
                  <ul>
                    {kids.map((k) => (
                      <li key={k} className="small muted latin">
                        {k}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </div>
          <h3 className="h3" style={{ marginTop: 'var(--s-7)' }}>
            {s.flow}
          </h3>
          <ol className="flow">
            {s.flowSteps.map((f, i) => (
              <li key={f}>
                <span className="num">{formatNumber(i + 1, lang)}</span>
                {f}
              </li>
            ))}
          </ol>
          <h3 className="h3" style={{ marginTop: 'var(--s-7)' }}>
            {s.adminTitle}
          </h3>
          <ul className="row" style={{ marginTop: 'var(--s-4)' }}>
            {adminModules.map((m) => (
              <li key={m} className="chip outline">
                {m}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section" aria-labelledby="ds-colors" dir="ltr" lang="en">
        <div className="container">
          <SectionHead id="ds-colors" title={s.colors} />
          <div className="swatches">
            {COLORS.map(([name, hex, use]) => (
              <div key={hex} className="swatch">
                <span className="swatch-chip" style={{ background: hex }} />
                <strong>{name}</strong>
                <code className="small muted">{hex}</code>
                <span className="small muted">{use}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section is-flush" aria-labelledby="ds-type">
        <div className="container">
          <SectionHead id="ds-type" title={s.type} intro={s.fontsNote} />
          <div className="type-specimens">
            <div className="surface" lang="en" dir="ltr">
              <p className="caption">Kanit ExtraBold Italic · display EN</p>
              <p className="ds-bebas">Dry ice wash</p>
              <p className="muted">ABCDEFGHIJKLMNOPQRSTUVWXYZ 0123456789</p>
            </div>
            <div className="surface" lang="ar" dir="rtl">
              <p className="caption">Readex Pro · عربي</p>
              <p className="ds-readex">غسيل بالثلج الجاف</p>
              <p className="muted">أ ب ت ث ج ح خ د ذ ر ز س ش ص ض ط ظ ع غ ف ق ك ل م ن ه و ي ٠١٢٣٤٥٦٧٨٩</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="ds-layout" dir="ltr" lang="en">
        <div className="container">
          <SectionHead id="ds-layout" title={s.layout} intro="Desktop 12 col · margin 80 · gutter 24 — Tablet 8 · 40 · 24 — Mobile 4 · 20 · 16 · max content 1280" />
          <div className="grid ds-grid-demo" aria-hidden="true">
            {Array.from({ length: 12 }, (_, i) => (
              <span key={i} />
            ))}
          </div>
          <SectionHead title={s.radius} />
          <div className="radii">
            {RADII.map(([n, r]) => (
              <div key={n} className="radius">
                <span style={{ borderRadius: r }} />
                <strong>{n}</strong>
                <span className="small muted">{r === 999 ? 'pill' : `${r}px`}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section is-flush" aria-labelledby="ds-components">
        <div className="container">
          <SectionHead id="ds-components" title={s.components} />
          <div className="surface ds-components">
            <div className="row">
              <button type="button" className="btn btn-primary">
                {t.common.bookNow}
              </button>
              <button type="button" className="btn btn-ghost">
                {t.common.viewPrices}
              </button>
              <button type="button" className="btn btn-quiet">
                {t.common.learnMore}
              </button>
            </div>
            <div className="row">
              {['booked', 'checked_in', 'washing', 'ready', 'completed', 'cancelled'].map((st) => (
                <span key={st} className={`status status-${st}`}>
                  {t.status[st]}
                </span>
              ))}
            </div>
            <div className="field" style={{ maxWidth: 360 }}>
              <label htmlFor="ds-input">{t.book.plate}</label>
              <input id="ds-input" className="input" placeholder={t.book.platePlaceholder} />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
