import Icon from '@/components/Icon';
import MessageForm from '@/components/forms/MessageForm';
import SubscribeButton from '@/components/forms/SubscribeButton';
import GiftCardForm from '@/components/forms/GiftCardForm';
import { PageHead, SectionHead } from '@/components/ui/bits';
import { getContent } from '@/lib/content';
import { currentCustomer } from '@/lib/auth';
import { formatMoney, formatNumber, getDict, href, tr } from '@/lib/i18n';

export async function generateMetadata({ params }) {
  const { lang } = await params;
  return { title: getDict(lang).memberships.title };
}

function PlanCard({ plan, lang, t, cur, loggedIn }) {
  return (
    <article className={`plan ${plan.featured ? 'is-featured' : ''}`}>
      <div className="row plan-top">
        <h3 className="pkg-name">{tr(plan.name, lang)}</h3>
        {plan.featured && <span className="chip copper">{t.common.popular}</span>}
      </div>
      <p className="muted">{tr(plan.description, lang)}</p>
      <p className="plan-price">
        <strong className="num">{formatMoney(plan.price, lang, cur)}</strong>
        <span className="muted">{plan.period === 'month' ? t.common.perMonth : plan.washes ? `· ${formatNumber(plan.washes, lang)} ${t.common.washes}` : ''}</span>
      </p>
      <ul className="pkg-list">
        {plan.perks.map((p, i) => (
          <li key={i}>
            <Icon name="check" size={18} />
            {tr(p, lang)}
          </li>
        ))}
      </ul>
      {plan.note && <p className="small muted">{tr(plan.note, lang)}</p>}
      <SubscribeButton
        planId={plan.id}
        label={plan.type === 'monthly' ? t.memberships.subscribe : t.memberships.buyBundle}
        loggedIn={loggedIn}
        t={t}
        accountHref={href(lang, '/account')}
        primary={plan.featured}
      />
    </article>
  );
}

export default async function MembershipsPage({ params }) {
  const { lang } = await params;
  const t = getDict(lang);
  const m = t.memberships;
  const c = await getContent();
  const customer = await currentCustomer();
  const cur = c.settings.currency;
  const monthly = c.plans.filter((p) => p.type === 'monthly');
  const bundles = c.plans.filter((p) => p.type === 'bundle');

  return (
    <>
      <PageHead title={m.title} intro={m.intro} />
      <section className="section" aria-labelledby="monthly-title">
        <div className="container">
          <SectionHead id="monthly-title" title={m.monthly} />
          <div className="plan-grid">
            {monthly.map((p) => (
              <PlanCard key={p.id} plan={p} lang={lang} t={t} cur={cur} loggedIn={Boolean(customer)} />
            ))}
          </div>
        </div>
      </section>
      <section className="section is-flush" aria-labelledby="bundles-title">
        <div className="container">
          <SectionHead id="bundles-title" title={m.bundles} />
          <div className="plan-grid">
            {bundles.map((p) => (
              <PlanCard key={p.id} plan={p} lang={lang} t={t} cur={cur} loggedIn={Boolean(customer)} />
            ))}
          </div>
        </div>
      </section>

      <section id="fleet" className="section services-band" aria-labelledby="fleet-title">
        <div className="container split">
          <div className="stack">
            <h2 id="fleet-title" className="h2">
              {m.fleetTitle}
            </h2>
            <p className="lead">{m.fleetText}</p>
          </div>
          <MessageForm
            kind="fleet"
            idPrefix="fleet"
            submitLabel={t.common.send}
            sendingText={t.common.sending}
            successText={m.fleetSent}
            errorText={t.common.errorGeneric}
            fields={[
              { name: 'company', label: m.company, required: true, autoComplete: 'organization' },
              { name: 'cars', label: m.cars, type: 'number', inputMode: 'numeric', required: true },
              { name: 'name', label: m.name, required: true, autoComplete: 'name' },
              { name: 'phone', label: m.phone, type: 'tel', required: true, autoComplete: 'tel' },
              { name: 'text', label: m.message, type: 'textarea', span: true },
            ]}
          />
        </div>
      </section>

      <section id="gift-cards" className="section" aria-labelledby="gift-title">
        <div className="container split">
          <div className="stack">
            <h2 id="gift-title" className="h2">
              {m.giftTitle}
            </h2>
            <p className="lead">{m.giftText}</p>
          </div>
          <GiftCardForm lang={lang} t={t} currency={cur} />
        </div>
      </section>
    </>
  );
}
