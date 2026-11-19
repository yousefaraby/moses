'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Icon from './Icon';
import { getJson, postJson } from '@/lib/client';
import { fmt } from '@/lib/dict';
import { formatDate, formatDateTime, formatMoney, formatNumber, formatTime, href, tr } from '@/lib/i18n';

function Login({ lang, t, onDone }) {
  const a = t.account;
  const [phone, setPhone] = useState('');
  const [stage, setStage] = useState('phone');
  const [info, setInfo] = useState(null);
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  async function send(e) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const r = await postJson('/api/auth/otp', { phone });
    setBusy(false);
    if (!r.ok) return setError(a.badPhone);
    setInfo(r);
    setStage('code');
  }
  async function verify(e) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const r = await postJson('/api/auth/verify', { phone, code, name });
    setBusy(false);
    if (!r.ok) return setError(r.error === 'name' ? t.book.errors.name : a.wrongCode);
    onDone();
  }

  return (
    <div className="auth-card">
      <h2 className="h3">{a.loginTitle}</h2>
      <p className="muted">{a.loginText}</p>
      {stage === 'phone' ? (
        <form className="stack" onSubmit={send}>
          <div className="field">
            <label htmlFor="acc-phone">{a.phone}</label>
            <input id="acc-phone" className="input latin" type="tel" inputMode="tel" autoComplete="tel" placeholder={a.phonePlaceholder} value={phone} onChange={(e) => setPhone(e.target.value)} required aria-invalid={Boolean(error)} />
            {error && <span className="error">{error}</span>}
          </div>
          <button type="submit" className="btn btn-primary btn-lg" disabled={busy}>
            {busy ? <span className="spinner" /> : a.sendCode}
          </button>
        </form>
      ) : (
        <form className="stack" onSubmit={verify}>
          <p className="small">{fmt(a.codeSent, { phone })}</p>
          <p className="notice copper">
            <Icon name="info" size={18} />
            <span className="latin">{fmt(a.demoCode, { code: info.demoCode })}</span>
          </p>
          <div className="field">
            <label htmlFor="acc-code">{a.code}</label>
            <input id="acc-code" className="input otp-input latin" inputMode="numeric" autoComplete="one-time-code" maxLength={4} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} required aria-invalid={Boolean(error)} />
          </div>
          {!info.exists && (
            <div className="field">
              <label htmlFor="acc-name">{a.name}</label>
              <input id="acc-name" className="input" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} required />
              <span className="hint">{a.newHere}</span>
            </div>
          )}
          {error && <span className="error">{error}</span>}
          <button type="submit" className="btn btn-primary btn-lg" disabled={busy || code.length !== 4}>
            {busy ? <span className="spinner" /> : a.verify}
          </button>
          <button type="button" className="text-btn" onClick={() => setStage('phone')}>
            {t.common.back}
          </button>
        </form>
      )}
    </div>
  );
}

export default function AccountApp({ lang, t, next, sizes, packages, plans, settings, today }) {
  const a = t.account;
  const router = useRouter();
  const [data, setData] = useState(null);
  const [tab, setTab] = useState('bookings');
  const [car, setCar] = useState({ label: '', plate: '', sizeId: 'sedan' });
  const [reward, setReward] = useState(null);
  const money = (n) => formatMoney(n, lang, settings.currency);

  const load = () => getJson('/api/account').then((r) => setData(r.ok ? r : { customer: null }));
  useEffect(() => {
    load();
  }, []);

  async function patch(body) {
    const r = await postJson('/api/account', body, 'PATCH');
    if (r.ok) setData(r);
    return r;
  }

  if (!data) return <div className="skeleton" style={{ height: 320, maxWidth: 480 }} />;

  if (!data.customer) {
    return (
      <Login
        lang={lang}
        t={t}
        onDone={() => {
          if (next === 'book') router.push(href(lang, '/book'));
          else if (next === 'memberships') router.push(href(lang, '/memberships'));
          else {
            load();
            router.refresh();
          }
        }}
      />
    );
  }

  const c = data.customer;
  const upcoming = data.bookings.filter((b) => b.isActive).sort((x, y) => (x.date + x.start > y.date + y.start ? 1 : -1));
  const past = data.bookings.filter((b) => !b.isActive);
  const need = Number(settings.loyalty.redeemPoints);
  const rewardPkg = packages.find((p) => p.id === settings.loyalty.rewardPackageId);

  const BookingRow = ({ b }) => (
    <li>
      <span className={`status status-${b.status}`}>{t.status[b.status]}</span>
      <div className="grow">
        <strong>
          {b.date === today ? t.common.today : formatDate(b.date, lang)} · {formatTime(b.start, lang)}
        </strong>
        <span className="small muted block">
          {tr(b.branch?.name, lang)} · {tr(packages.find((p) => p.id === b.packageId)?.name, lang)} · <span className="latin">{b.code}</span>
        </span>
      </div>
      <strong className="num">{money(b.price.total)}</strong>
      <Link className="btn btn-ghost btn-sm" href={href(lang, `/booking/${b.id}?t=${b.token}`)}>
        {a.manage}
      </Link>
    </li>
  );

  return (
    <div className="stack" style={{ gap: 'var(--s-5)' }}>
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <h2 className="h2">{fmt(a.welcome, { name: c.name.split(' ')[0] })}</h2>
        <div className="row">
          <Link href={href(lang, '/book')} className="btn btn-primary">
            {t.common.bookNow}
          </Link>
          <button
            type="button"
            className="btn btn-quiet"
            onClick={async () => {
              await postJson('/api/auth/logout', {});
              setData({ customer: null });
              router.refresh();
            }}
          >
            <Icon name="logout" size={20} className="flip" />
            {a.logout}
          </button>
        </div>
      </div>

      <div className="tabs" role="tablist" aria-label={a.title}>
        {Object.entries(a.tabs).map(([id, label]) => (
          <button key={id} type="button" role="tab" id={`tab-${id}`} aria-controls={`panel-${id}`} aria-selected={tab === id} onClick={() => setTab(id)}>
            {label}
          </button>
        ))}
      </div>

      {tab === 'bookings' && (
        <div role="tabpanel" id="panel-bookings" aria-labelledby="tab-bookings" className="stack" style={{ gap: 'var(--s-6)' }}>
          {data.bookings.length === 0 && (
            <div className="notice">
              <Icon name="calendar" size={20} />
              {a.noBookings}
            </div>
          )}
          {upcoming.length > 0 && (
            <div className="stack">
              <h3 className="caption">{a.upcoming}</h3>
              <ul className="list-rows">
                {upcoming.map((b) => (
                  <BookingRow key={b.id} b={b} />
                ))}
              </ul>
            </div>
          )}
          {past.length > 0 && (
            <div className="stack">
              <h3 className="caption">{a.past}</h3>
              <ul className="list-rows">
                {past.map((b) => (
                  <BookingRow key={b.id} b={b} />
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {tab === 'cars' && (
        <div role="tabpanel" id="panel-cars" aria-labelledby="tab-cars" className="stack" style={{ gap: 'var(--s-6)' }}>
          {c.cars.length === 0 ? (
            <p className="notice">{a.carsEmpty}</p>
          ) : (
            <ul className="list-rows">
              {c.cars.map((x) => (
                <li key={x.id}>
                  <Icon name={sizes.find((s) => s.id === x.sizeId)?.icon || 'car'} size={28} />
                  <div className="grow">
                    <strong>{x.label || x.plate}</strong>
                    <span className="small muted block">
                      {x.plate} · {tr(sizes.find((s) => s.id === x.sizeId)?.name, lang)}
                    </span>
                  </div>
                  <Link className="btn btn-ghost btn-sm" href={href(lang, `/book?size=${x.sizeId}`)}>
                    {t.common.bookNow}
                  </Link>
                  <button type="button" className="btn btn-quiet btn-sm" onClick={() => patch({ action: 'removeCar', carId: x.id })}>
                    <Icon name="trash" size={18} />
                    {a.removeCar}
                  </button>
                </li>
              ))}
            </ul>
          )}
          <form
            className="surface form-grid two"
            onSubmit={async (e) => {
              e.preventDefault();
              const r = await patch({ action: 'addCar', ...car });
              if (r.ok) setCar({ label: '', plate: '', sizeId: 'sedan' });
            }}
          >
            <div className="field">
              <label htmlFor="car-label">{a.carLabel}</label>
              <input id="car-label" className="input" value={car.label} onChange={(e) => setCar({ ...car, label: e.target.value })} />
            </div>
            <div className="field">
              <label htmlFor="car-plate">{a.plate}</label>
              <input id="car-plate" className="input" required value={car.plate} onChange={(e) => setCar({ ...car, plate: e.target.value })} />
            </div>
            <div className="field span-2">
              <label htmlFor="car-size">{a.size}</label>
              <select id="car-size" className="select" value={car.sizeId} onChange={(e) => setCar({ ...car, sizeId: e.target.value })}>
                {sizes.map((s) => (
                  <option key={s.id} value={s.id}>
                    {tr(s.name, lang)}
                  </option>
                ))}
              </select>
            </div>
            <div className="span-2">
              <button className="btn btn-primary" type="submit">
                <Icon name="plus" size={20} />
                {a.addCar}
              </button>
            </div>
          </form>
        </div>
      )}

      {tab === 'membership' && (
        <div role="tabpanel" id="panel-membership" aria-labelledby="tab-membership" className="stack" style={{ gap: 'var(--s-6)' }}>
          <section className="surface stack">
            <h3 className="caption">{a.points}</h3>
            <p className="big-num num">{formatNumber(c.points, lang)}</p>
            <div className="points-meter" aria-hidden="true">
              <span style={{ width: `${Math.min(100, (c.points / need) * 100)}%` }} />
            </div>
            <p className="small muted">
              {fmt(a.pointsText, { per: formatNumber(settings.loyalty.pointsPer100, lang), redeem: formatNumber(need, lang), pkg: tr(rewardPkg?.name, lang) })}
            </p>
            {c.points >= need ? (
              <div>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={async () => {
                    const r = await patch({ action: 'redeem' });
                    if (r.ok) setReward(r.code);
                  }}
                >
                  <Icon name="gift" size={20} />
                  {fmt(a.redeem, { n: formatNumber(need, lang) })}
                </button>
              </div>
            ) : (
              <p className="small">{fmt(a.notEnough, { n: formatNumber(need - c.points, lang) })}</p>
            )}
            {reward && <p className="notice ok">{fmt(a.redeemed, { code: reward })}</p>}
            {data.rewards.length > 0 && (
              <ul className="row">
                {data.rewards.map((r) => (
                  <li key={r.code} className="chip copper latin">
                    {r.code}
                  </li>
                ))}
              </ul>
            )}
          </section>
          <section className="stack">
            <h3 className="caption">{a.activePlan}</h3>
            {data.subscriptions.length === 0 ? (
              <div className="row">
                <p className="muted">{a.noPlan}</p>
                <Link href={href(lang, '/memberships')} className="btn btn-ghost btn-sm">
                  {a.seePlans}
                </Link>
              </div>
            ) : (
              <ul className="list-rows">
                {data.subscriptions.map((s) => {
                  const plan = plans.find((p) => p.id === s.planId);
                  return (
                    <li key={s.id}>
                      <span className={`status ${s.status === 'active' ? 'status-completed' : 'status-cancelled'}`}>{s.status === 'active' ? t.admin.active : t.admin.ended}</span>
                      <div className="grow">
                        <strong>{tr(plan?.name, lang)}</strong>
                        <span className="small muted block">{fmt(a.since, { date: formatDate(s.startedAt, lang) })}</span>
                      </div>
                      <span>{s.washesLeft === null ? a.unlimited : fmt(a.washesLeft, { n: formatNumber(s.washesLeft, lang) })}</span>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>
      )}

      {tab === 'invoices' && (
        <div role="tabpanel" id="panel-invoices" aria-labelledby="tab-invoices" className="stack">
          {data.payments.length === 0 ? (
            <p className="notice">{a.invoicesEmpty}</p>
          ) : (
            <ul className="list-rows">
              {data.payments.map((p) => (
                <li key={p.id}>
                  <Icon name="card" size={24} />
                  <div className="grow">
                    <strong>
                      {a.invoice} <span className="latin">#{p.id.toUpperCase()}</span>
                    </strong>
                    <span className="small muted block">
                      {formatDateTime(p.at, lang)} · {t.payment[p.method] || p.method}
                    </span>
                  </div>
                  <span className={`status ${p.status === 'paid' ? 'status-completed' : 'status-cancelled'}`}>{t.payment[p.status]}</span>
                  <strong className="num">{money(p.amount)}</strong>
                </li>
              ))}
            </ul>
          )}
          <div>
            <button type="button" className="btn btn-quiet no-print" onClick={() => window.print()}>
              <Icon name="print" size={20} />
              {a.print}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
