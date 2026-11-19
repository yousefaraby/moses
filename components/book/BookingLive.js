'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import Icon from '../Icon';
import { getJson, postJson } from '@/lib/client';
import { fmt } from '@/lib/dict';
import { formatDate, formatDuration, formatMoney, formatNumber, formatTime, href, tr } from '@/lib/i18n';
import { addDays, weekdayOf } from '@/lib/time';

const TRACK = ['booked', 'checked_in', 'washing', 'ready'];

function TrackCard({ b, lang, t, staffName }) {
  const k = t.booking;
  const team = staffName || fmt(k.trackTeam, { branch: tr(b.branch?.name, lang) });
  const initials = team
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
  const eta = b.status === 'booked' ? formatTime(b.start, lang) : t.status[b.status];
  return (
    <section className="track-card" aria-labelledby="track-card-title">
      <h2 id="track-card-title" className="h3">
        {k.trackTitle}
      </h2>
      <div className="track-who">
        <span className="track-avatar" aria-hidden="true">
          {initials}
        </span>
        <div className="grow">
          <strong>{team}</strong>
          <span className="small muted block">{t.statusText[b.status]}</span>
        </div>
        <span className="chip copper">
          {k.eta} {eta}
        </span>
      </div>
      <div className="track-map" aria-hidden="true">
        <svg viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice">
          <rect width="320" height="200" fill="#121417" />
          <g stroke="#23262b" strokeWidth="6" fill="none">
            <path d="M0 40 L320 70 M0 120 L320 100 M0 170 L320 190 M60 0 L90 200 M150 0 L140 200 M230 0 L260 200 M300 0 L280 200" />
          </g>
          <g stroke="#1b1d21" strokeWidth="2" fill="none">
            <path d="M0 80 L320 85 M0 145 L320 150 M110 0 L120 200 M195 0 L200 200" />
          </g>
          <path className="track-route" d="M80 160 L95 120 L150 112 L198 104 L240 70" stroke="#f5922f" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <g transform="translate(240 70)">
            <circle r="15" fill="#f5922f" />
            <path d="M-6 2 L0 -5 L6 2 V7 H-6 Z" fill="#111" />
          </g>
          <g transform="translate(80 160)">
            <circle r="13" fill="#fff" />
            <circle r="5" fill="#f5922f" />
          </g>
        </svg>
      </div>
      <div className="track-car">
        <Icon name="car" size={22} />
        <span className="grow">
          {k.car}: {b.customer?.plate}
        </span>
        {b.branch?.phone && (
          <a className="track-call" href={`tel:${b.branch.phone.replace(/\s/g, '')}`} aria-label={k.callBranch}>
            <Icon name="phone" size={20} />
          </a>
        )}
      </div>
    </section>
  );
}

export default function BookingLive({ lang, t, token, initial, qr, isNew, today, settings, names, hours, staffName }) {
  const k = t.booking;
  const [b, setB] = useState(initial);
  const [panel, setPanel] = useState(null); // 'reschedule' | 'cancel'
  const [date, setDate] = useState(initial.date);
  const [slots, setSlots] = useState({ loading: false, list: [] });
  const [time, setTime] = useState('');
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);
  const [rating, setRating] = useState(0);
  const [text, setText] = useState('');
  const [rated, setRated] = useState(null);
  const money = (n) => formatMoney(n, lang, settings.currency);

  useEffect(() => {
    if (!b.isActive) return undefined;
    const id = setInterval(async () => {
      const r = await getJson(`/api/bookings/${b.id}?t=${encodeURIComponent(token)}`);
      if (r.ok) setB(r.booking);
    }, 15000);
    return () => clearInterval(id);
  }, [b.id, b.isActive, token]);

  useEffect(() => {
    if (panel !== 'reschedule') return undefined;
    let alive = true;
    setSlots({ loading: true, list: [] });
    const p = new URLSearchParams({ branch: b.branchId, date, package: b.packageId, size: b.sizeId, addons: b.addonIds.join(','), mode: b.mode, exclude: b.id });
    getJson(`/api/slots?${p}`).then((r) => alive && setSlots({ loading: false, list: r.ok ? r.slots : [] }));
    return () => {
      alive = false;
    };
  }, [panel, date, b]);

  async function act(action, extra = {}) {
    setBusy(true);
    setMsg(null);
    const r = await postJson(`/api/bookings/${b.id}`, { token, action, ...extra }, 'PATCH');
    setBusy(false);
    if (r.ok) {
      setB(r.booking);
      return r;
    }
    if (r.error === 'tooLate') setMsg({ kind: 'danger', text: fmt(k.tooLate, { h: formatNumber(settings.cancelHours, lang) }) });
    else if (r.error === 'slotTaken') setMsg({ kind: 'danger', text: t.book.slotTaken });
    else setMsg({ kind: 'danger', text: t.common.errorGeneric });
    return null;
  }

  const stepIndex = TRACK.indexOf(b.status === 'completed' ? 'ready' : b.status);
  const when = `${b.date === today ? t.common.today : formatDate(b.date, lang, { weekday: 'long', day: 'numeric', month: 'long' })} · ${formatTime(b.start, lang)}`;
  const resource = String(b.bay).startsWith('M') ? fmt(k.van, { n: String(b.bay).slice(1) }) : fmt(k.bay, { n: formatNumber(b.bay, lang) });
  const rebook = href(lang, `/book?branch=${b.branchId}&size=${b.sizeId}&package=${b.packageId}`);
  const days = Array.from({ length: Math.min(14, settings.maxDaysAhead) }, (_, i) => addDays(today, i));
  const points = Math.floor((500 / 100) * Number(settings.loyalty?.pointsPer100 || 0));

  return (
    <div className="container section booking-page">
      <div className="stack" style={{ gap: 'var(--s-5)' }}>
        <div className="stack">
          {isNew && b.status === 'booked' ? (
            <>
              <h1 className="h1">{k.confirmed}</h1>
              <p className="lead">{k.confirmedText}</p>
            </>
          ) : (
            <h1 className="h1">{t.status[b.status]}</h1>
          )}
        </div>

        <section className="ticket" aria-label={k.receipt}>
          <div className="mist" aria-hidden="true">
            <i />
            <i />
            <i />
          </div>
          <div className="stack" style={{ position: 'relative', gap: 'var(--s-5)' }}>
            <div>
              <p className="small muted">{k.code}</p>
              <p className="ticket-code latin">{b.code}</p>
            </div>
            <dl className="ticket-facts">
              <div>
                <dt className="small muted">{k.when}</dt>
                <dd>{when}</dd>
                <dd className="small muted">{formatDuration(b.duration, lang)}</dd>
              </div>
              <div>
                <dt className="small muted">{k.where}</dt>
                <dd>
                  {tr(b.branch?.name, lang)} · {resource}
                </dd>
                <dd className="small muted">{b.mode === 'mobile' ? b.address : tr(b.branch?.address, lang)}</dd>
              </div>
              <div>
                <dt className="small muted">{k.what}</dt>
                <dd>
                  {tr(names.package, lang)} · {tr(names.size, lang)}
                </dd>
                {names.addons.length > 0 && <dd className="small muted">{names.addons.map((a) => tr(a, lang)).join('، ')}</dd>}
              </div>
              <div>
                <dt className="small muted">{k.payment}</dt>
                <dd>
                  <strong className="num">{money(b.price.total)}</strong> · {t.payment[b.payment.status]}
                </dd>
                {b.price.discount > 0 && <dd className="small copper">−{money(b.price.discount)}</dd>}
              </div>
              {b.status === 'booked' && (
                <div>
                  <dt className="small muted">{k.reminders}</dt>
                  <dd className="small">
                    {[settings.reminders.firstHours, settings.reminders.secondHours]
                      .filter(Boolean)
                      .map((h) => fmt(k.reminderAt, { h: formatNumber(h, lang) }))
                      .join(' · ')}
                  </dd>
                </div>
              )}
            </dl>
          </div>
          {b.isActive && (
            <figure className="ticket-qr" style={{ position: 'relative', margin: 0 }}>
              <div dangerouslySetInnerHTML={{ __html: qr }} role="img" aria-label={k.qr} />
              <figcaption className="small" style={{ color: '#333', textAlign: 'center', marginTop: 8 }}>
                {k.qr}
              </figcaption>
            </figure>
          )}
        </section>

        {['booked', 'checked_in', 'washing', 'ready', 'completed'].includes(b.status) && (
          <section className="surface stack" aria-labelledby="track-title">
            <div className="row" style={{ justifyContent: 'space-between' }}>
              <h2 id="track-title" className="h3">
                {k.status}
              </h2>
              <span className={`status status-${b.status}`}>{t.status[b.status]}</span>
            </div>
            <ol className="track">
              {TRACK.map((s, i) => (
                <li key={s} className={i < stepIndex || b.status === 'completed' ? 'is-done' : i === stepIndex ? 'is-now' : ''}>
                  {t.status[s]}
                </li>
              ))}
            </ol>
            <p aria-live="polite">{t.statusText[b.status]}</p>
            {b.isActive && <p className="small muted">{k.statusHint}</p>}
            {b.status === 'booked' && b.date === today && (
              <div className="row">
                <button type="button" className="btn btn-primary" disabled={busy} onClick={() => act('checkin')}>
                  <Icon name="qr" size={20} />
                  {k.checkin}
                </button>
                <span className="small muted">{k.checkinHint}</span>
              </div>
            )}
          </section>
        )}

        {b.payment.status === 'pending' && b.status !== 'cancelled' && (
          <section className="instapay-box pay-pending" aria-labelledby="pay-title">
            <h2 id="pay-title" className="h3">
              {t.payment.pending}
            </h2>
            <p>{fmt(t.book.instapayTitle, { total: money(b.price.total) })}</p>
            <p className="copy-row">
              <span className="copy-text">
                <span className="small muted block">{t.book.instapayAddress}</span>
                <strong className="latin">{settings.payment?.instapay || 'mosesdetailing@instapay'}</strong>
              </span>
            </p>
            {settings.payment?.wallet && (
              <p className="copy-row">
                <span className="copy-text">
                  <span className="small muted block">{fmt(t.book.walletNumber, { name: tr(settings.payment.walletName, lang) })}</span>
                  <strong className="latin">{settings.payment.wallet}</strong>
                </span>
              </p>
            )}
            {b.payment.reference && (
              <p className="small muted">
                {t.admin.reference}: <span className="latin">{b.payment.reference}</span>
              </p>
            )}
            <p className="small copper">{t.book.instapayNote}</p>
          </section>
        )}

        {b.isActive && <TrackCard b={b} lang={lang} t={t} staffName={staffName} />}

        {b.status === 'cancelled' && <p className="notice">{k.cancelled}</p>}

        {msg && (
          <p className={`notice ${msg.kind}`} role="alert">
            {msg.text}
          </p>
        )}

        {b.status === 'booked' && (
          <section className="stack no-print">
            {b.canChange ? (
              <div className="row">
                <button type="button" className="btn btn-ghost" aria-expanded={panel === 'reschedule'} onClick={() => setPanel(panel === 'reschedule' ? null : 'reschedule')}>
                  <Icon name="calendar" size={20} />
                  {k.reschedule}
                </button>
                <button type="button" className="btn btn-quiet" aria-expanded={panel === 'cancel'} onClick={() => setPanel(panel === 'cancel' ? null : 'cancel')}>
                  {k.cancel}
                </button>
              </div>
            ) : (
              <p className="small muted">{fmt(k.tooLate, { h: formatNumber(settings.cancelHours, lang) })}</p>
            )}

            {panel === 'reschedule' && (
              <div className="surface stack">
                <h2 className="h3">{k.rescheduleTitle}</h2>
                <div className="date-strip">
                  {days.map((d) => {
                    const h = hours[weekdayOf(d)];
                    const closed = !h || h.closed;
                    return (
                      <button key={d} type="button" role="radio" aria-checked={date === d} disabled={closed} className="date-chip" onClick={() => {
                        setDate(d);
                        setTime('');
                      }}>
                        <span className="small">{d === today ? t.common.today : formatDate(d, lang, { weekday: 'short' })}</span>
                        <strong className="num">{formatDate(d, lang, { day: 'numeric' })}</strong>
                        <span className="small muted">{closed ? t.book.closedDay : formatDate(d, lang, { month: 'short' })}</span>
                      </button>
                    );
                  })}
                </div>
                <div className="slot-grid" role="radiogroup" aria-label={k.rescheduleTitle}>
                  {slots.loading
                    ? Array.from({ length: 6 }, (_, i) => <span key={i} className="skeleton slot-skel" />)
                    : slots.list.map((s) => (
                        <button key={s.time} type="button" role="radio" aria-checked={time === s.time} className={`slot ${s.quiet ? 'is-quiet' : ''}`} onClick={() => setTime(s.time)}>
                          <span className="num">{formatTime(s.time, lang)}</span>
                        </button>
                      ))}
                </div>
                {!slots.loading && slots.list.length === 0 && <p className="notice">{t.book.noSlots}</p>}
                <div>
                  <button
                    type="button"
                    className="btn btn-primary"
                    disabled={!time || busy}
                    onClick={async () => {
                      const r = await act('reschedule', { date, start: time });
                      if (r) {
                        setPanel(null);
                        setMsg({ kind: 'ok', text: k.moved });
                      }
                    }}
                  >
                    {k.saveTime}
                  </button>
                </div>
              </div>
            )}

            {panel === 'cancel' && (
              <div className="surface stack">
                <p className="h3">{k.cancelConfirm}</p>
                <p className="small muted">{fmt(t.book.policy, { h: formatNumber(settings.cancelHours, lang) })}</p>
                <div className="row">
                  <button type="button" className="btn btn-ghost" disabled={busy} onClick={async () => (await act('cancel')) && setPanel(null)}>
                    {k.cancelYes}
                  </button>
                  <button type="button" className="btn btn-quiet" onClick={() => setPanel(null)}>
                    {k.cancelKeep}
                  </button>
                </div>
              </div>
            )}
          </section>
        )}

        {b.status === 'completed' && !b.rating && !rated && (
          <section className="surface stack no-print" aria-labelledby="rate-title">
            <h2 id="rate-title" className="h3">
              {k.rateTitle}
            </h2>
            <p className="muted">{fmt(k.rateText, { n: formatNumber(points, lang) })}</p>
            <div className="rate-stars" role="radiogroup" aria-label={k.rateTitle}>
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} type="button" role="radio" aria-checked={rating === n} aria-label={fmt(t.common.stars, { n })} className={n <= rating ? 'is-lit' : ''} onClick={() => setRating(n)}>
                  <Icon name="star" size={30} />
                </button>
              ))}
            </div>
            <div className="field">
              <label htmlFor="rate-text">{k.comment}</label>
              <textarea id="rate-text" className="textarea" value={text} onChange={(e) => setText(e.target.value)} />
            </div>
            <div>
              <button
                type="button"
                className="btn btn-primary"
                disabled={!rating || busy}
                onClick={async () => {
                  const r = await act('rate', { rating, text });
                  if (r) setRated(r.points || 0);
                }}
              >
                {k.submit}
              </button>
            </div>
          </section>
        )}
        {rated !== null && (
          <p className="notice ok" role="status">
            {rated ? fmt(k.thanks, { n: formatNumber(rated, lang) }) : k.thanksGuest}
          </p>
        )}

        <div className="row no-print">
          <Link href={rebook} className="btn btn-ghost">
            <Icon name="route" size={20} />
            {k.rebook}
          </Link>
          <button type="button" className="btn btn-quiet" onClick={() => window.print()}>
            <Icon name="print" size={20} />
            {k.print}
          </button>
        </div>
      </div>
    </div>
  );
}
