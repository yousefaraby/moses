'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Icon from '../Icon';
import { postJson } from '@/lib/client';
import { fmt } from '@/lib/dict';
import { formatDate, formatDateTime, formatMoney, formatTime, href, tr } from '@/lib/i18n';
import { addDays, toMinutes, toHHMM, weekdayOf } from '@/lib/time';

const STATUSES = ['booked', 'checked_in', 'washing', 'ready', 'completed', 'cancelled', 'no_show'];
const NEXT = { booked: 'checked_in', checked_in: 'washing', washing: 'ready', ready: 'completed' };

export function BookingPanel({ booking, lang, t, staff, packages, sizes, addons, branches, currency, onClose }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);
  const [move, setMove] = useState({ date: booking.date, start: booking.start });
  const a = t.admin;
  const pkg = packages.find((p) => p.id === booking.packageId);
  const size = sizes.find((s) => s.id === booking.sizeId);
  const branch = branches.find((b) => b.id === booking.branchId);

  async function patch(body) {
    setBusy(true);
    setErr(null);
    const r = await postJson(`/api/admin/bookings/${booking.id}`, body, 'PATCH');
    setBusy(false);
    if (!r.ok) setErr(r.error === 'slotTaken' ? t.book.slotTaken : t.common.errorGeneric);
    router.refresh();
  }

  return (
    <aside className="booking-panel" aria-label={a.details}>
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <h2 className="h3 latin">{booking.code}</h2>
        {onClose && (
          <button type="button" className="btn btn-quiet btn-icon btn-sm" aria-label={t.common.close} onClick={onClose}>
            <Icon name="close" size={20} />
          </button>
        )}
      </div>
      <span className={`status status-${booking.status}`}>{t.status[booking.status]}</span>
      <dl className="kv">
        <div>
          <dt>{a.customer}</dt>
          <dd>
            {booking.customer.name} · <a className="link latin" href={`tel:${booking.customer.phone}`}>{booking.customer.phone}</a>
          </dd>
        </div>
        <div>
          <dt>{t.book.plate}</dt>
          <dd>{booking.customer.plate}</dd>
        </div>
        <div>
          <dt>{a.time}</dt>
          <dd>
            {formatDate(booking.date, lang)} · {formatTime(booking.start, lang)}–{formatTime(toHHMM(toMinutes(booking.start) + booking.duration), lang)}
          </dd>
        </div>
        <div>
          <dt>{a.branch}</dt>
          <dd>
            {tr(branch?.name, lang)} · {String(booking.bay).startsWith('M') ? fmt(t.booking.van, { n: String(booking.bay).slice(1) }) : fmt(t.booking.bay, { n: booking.bay })}
            {booking.mode === 'mobile' && <span className="block small muted">{booking.address}</span>}
          </dd>
        </div>
        <div>
          <dt>{a.service}</dt>
          <dd>
            {tr(pkg?.name, lang)} · {tr(size?.name, lang)}
            {booking.addonIds.length > 0 && <span className="block small muted">{booking.addonIds.map((id) => tr(addons.find((x) => x.id === id)?.name, lang)).join('، ')}</span>}
          </dd>
        </div>
        <div>
          <dt>{a.total}</dt>
          <dd>
            <strong className="num">{formatMoney(booking.price.total, lang, currency)}</strong> · {t.payment[booking.payment.status]} ({t.payment[booking.payment.method] || booking.payment.method})
            {booking.payment.reference && (
              <span className="block small muted">
                {a.reference}: <span className="latin">{booking.payment.reference}</span>
              </span>
            )}
            {booking.promo && <span className="block small muted latin">{booking.promo}</span>}
          </dd>
        </div>
        {booking.notes && (
          <div>
            <dt>{a.notes}</dt>
            <dd>{booking.notes}</dd>
          </div>
        )}
        {booking.rating && (
          <div>
            <dt>{a.rating}</dt>
            <dd>
              {booking.rating}/5 {booking.reviewText && <span className="block small muted">{booking.reviewText}</span>}
            </dd>
          </div>
        )}
      </dl>

      {NEXT[booking.status] && (
        <button type="button" className="btn btn-primary btn-block" disabled={busy} onClick={() => patch({ status: NEXT[booking.status] })}>
          <Icon name="arrow" size={18} className="flip" />
          {t.status[NEXT[booking.status]]}
        </button>
      )}

      <div className="field">
        <label htmlFor={`st-${booking.id}`}>{a.setStatus}</label>
        <select id={`st-${booking.id}`} className="select" value={booking.status} disabled={busy} onChange={(e) => patch({ status: e.target.value })}>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {t.status[s]}
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        <label htmlFor={`sf-${booking.id}`}>{a.assign}</label>
        <select id={`sf-${booking.id}`} className="select" value={booking.staffId || ''} disabled={busy} onChange={(e) => patch({ staffId: e.target.value })}>
          <option value="">{a.unassigned}</option>
          {staff
            .filter((s) => s.active !== false && s.branchId === booking.branchId)
            .map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} · {a.roles[s.role] || s.role}
              </option>
            ))}
        </select>
      </div>
      <div className="row">
        {booking.payment.status === 'pending' && (
          <button type="button" className="btn btn-primary btn-sm" disabled={busy} onClick={() => patch({ payment: 'paid', method: 'instapay' })}>
            <Icon name="check" size={18} />
            {a.confirmInstapay}
          </button>
        )}
        {booking.payment.status === 'unpaid' && (
          <>
            <button type="button" className="btn btn-ghost btn-sm" disabled={busy} onClick={() => patch({ payment: 'paid', method: 'cash' })}>
              <Icon name="cash" size={18} />
              {a.markPaid} · {t.payment.cash}
            </button>
            <button type="button" className="btn btn-ghost btn-sm" disabled={busy} onClick={() => patch({ payment: 'paid', method: 'card' })}>
              <Icon name="card" size={18} />
              {t.payment.card}
            </button>
          </>
        )}
        {booking.payment.status === 'paid' && (
          <button type="button" className="btn btn-quiet btn-sm" disabled={busy} onClick={() => window.confirm(`${a.refund}?`) && patch({ payment: 'refunded' })}>
            {a.refund}
          </button>
        )}
      </div>
      <fieldset className="fieldset-reset stack-sm">
        <legend className="label small muted">{a.moveTo}</legend>
        <div className="row">
          <input className="input" type="date" aria-label={a.date} value={move.date} onChange={(e) => setMove({ ...move, date: e.target.value })} style={{ flex: '1 1 140px' }} />
          <input className="input" type="time" step="900" aria-label={a.time} value={move.start} onChange={(e) => setMove({ ...move, start: e.target.value })} style={{ flex: '1 1 110px' }} />
          <button type="button" className="btn btn-ghost" disabled={busy || (move.date === booking.date && move.start === booking.start)} onClick={() => patch({ move })}>
            {a.move}
          </button>
        </div>
      </fieldset>
      {err && <p className="notice danger">{err}</p>}
      <div className="row">
        <Link className="link small" href={href(lang, `/booking/${booking.id}`)} target="_blank">
          {t.booking.receipt}
        </Link>
      </div>
      <details>
        <summary className="small muted">{a.history}</summary>
        <ul className="small muted" style={{ listStyle: 'none', marginTop: 8 }}>
          {booking.history.map((h, i) => (
            <li key={i}>
              {formatDateTime(h.at, lang)} · {t.status[h.status] || h.status}
            </li>
          ))}
        </ul>
      </details>
    </aside>
  );
}

export default function BookingBoard({ lang, t, date, today, branchId, bookings, branches, staff, packages, sizes, addons, currency }) {
  const router = useRouter();
  const [selected, setSelected] = useState(null);
  const [view, setView] = useState('grid');
  const a = t.admin;
  const branch = branches.find((b) => b.id === branchId) || branches[0];
  const hours = branch.hours[weekdayOf(date)];
  const open = hours && !hours.closed ? toMinutes(hours.open) : 9 * 60;
  const close = hours && !hours.closed ? toMinutes(hours.close) : 22 * 60;
  const bays = [...Array.from({ length: branch.bays }, (_, i) => i + 1), ...Array.from({ length: branch.mobileUnits || 0 }, (_, i) => `M${i + 1}`)];
  const dayBookings = bookings.filter((b) => b.branchId === branch.id).sort((x, y) => (x.start > y.start ? 1 : -1));
  const sel = dayBookings.find((b) => b.id === selected);
  const go = (patch) => {
    const p = new URLSearchParams({ date, branch: branch.id, ...patch });
    router.push(`${href(lang, '/admin/bookings')}?${p}`);
  };
  const hourMarks = [];
  for (let m = Math.ceil(open / 60) * 60; m < close; m += 60) hourMarks.push(m);
  const PX = 1.6; // px per minute

  return (
    <div className="board">
      <div className="board-tools">
        <div className="row">
          <button type="button" className="btn btn-ghost btn-icon" aria-label={a.prev} onClick={() => go({ date: addDays(date, -1) })}>
            <Icon name="chevron" size={20} className="flip-back" />
          </button>
          <input className="input board-date" type="date" aria-label={a.day} value={date} onChange={(e) => e.target.value && go({ date: e.target.value })} />
          <button type="button" className="btn btn-ghost btn-icon" aria-label={a.nextDay} onClick={() => go({ date: addDays(date, 1) })}>
            <Icon name="chevron" size={20} className="flip" />
          </button>
          {date !== today && (
            <button type="button" className="btn btn-quiet btn-sm" onClick={() => go({ date: today })}>
              {a.today}
            </button>
          )}
        </div>
        <div className="segmented" role="group" aria-label={a.branch}>
          {branches.map((b) => (
            <button key={b.id} type="button" aria-pressed={b.id === branch.id} onClick={() => go({ branch: b.id })}>
              {tr(b.name, lang)}
            </button>
          ))}
        </div>
        <div className="segmented" role="group">
          <button type="button" aria-pressed={view === 'grid'} onClick={() => setView('grid')}>
            {a.grid}
          </button>
          <button type="button" aria-pressed={view === 'list'} onClick={() => setView('list')}>
            {a.list}
          </button>
        </div>
      </div>

      <p className="small muted">
        {formatDate(date, lang, { weekday: 'long', day: 'numeric', month: 'long' })} · {t.account.tabs.bookings}: {dayBookings.filter((b) => !['cancelled', 'no_show'].includes(b.status)).length}
      </p>

      <div className={`board-body ${sel ? 'has-panel' : ''}`}>
        {view === 'grid' ? (
          <div className="cal-scroll">
            <div className="cal" style={{ '--cols': bays.length, height: (close - open) * PX + 40 }}>
              <div className="cal-head">
                <span />
                {bays.map((bay) => (
                  <span key={bay} className="cal-col-title">
                    {String(bay).startsWith('M') ? fmt(t.booking.van, { n: String(bay).slice(1) }) : fmt(t.booking.bay, { n: bay })}
                  </span>
                ))}
              </div>
              <div className="cal-grid">
                <div className="cal-times">
                  {hourMarks.map((m) => (
                    <span key={m} style={{ top: (m - open) * PX }}>
                      {formatTime(toHHMM(m), lang)}
                    </span>
                  ))}
                </div>
                {bays.map((bay) => (
                  <div key={bay} className="cal-col">
                    {hourMarks.map((m) => (
                      <span key={m} className="cal-line" style={{ top: (m - open) * PX }} />
                    ))}
                    {(branch.blocked || [])
                      .filter((bl) => bl.date === date && (!bl.bay || String(bl.bay) === String(bay)))
                      .map((bl, i) => (
                        <span key={i} className="cal-block" style={{ top: (toMinutes(bl.from) - open) * PX, height: (toMinutes(bl.to) - toMinutes(bl.from)) * PX }}>
                          {bl.reason || a.blocked}
                        </span>
                      ))}
                    {dayBookings
                      .filter((b) => String(b.bay) === String(bay))
                      .map((b) => (
                        <button
                          key={b.id}
                          type="button"
                          className={`cal-event status-${b.status} ${selected === b.id ? 'is-selected' : ''}`}
                          style={{ top: (toMinutes(b.start) - open) * PX, height: Math.max(28, b.duration * PX - 3) }}
                          onClick={() => setSelected(b.id)}
                        >
                          <strong>{formatTime(b.start, lang)}</strong> {b.customer.name}
                          <span className="block">
                            {tr(packages.find((p) => p.id === b.packageId)?.name, lang)} · {tr(sizes.find((s) => s.id === b.sizeId)?.name, lang)}
                          </span>
                        </button>
                      ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <ul className="list-rows admin-list">
            {dayBookings.length === 0 && <li className="muted">{a.noneToday}</li>}
            {dayBookings.map((b) => (
              <li key={b.id}>
                <strong className="num">{formatTime(b.start, lang)}</strong>
                <span className={`status status-${b.status}`}>{t.status[b.status]}</span>
                <div className="grow">
                  <strong>{b.customer.name}</strong>
                  <span className="small muted block">
                    {tr(packages.find((p) => p.id === b.packageId)?.name, lang)} · {b.customer.plate} · {String(b.bay).startsWith('M') ? fmt(t.booking.van, { n: String(b.bay).slice(1) }) : fmt(t.booking.bay, { n: b.bay })}
                  </span>
                </div>
                <strong className="num">{formatMoney(b.price.total, lang, currency)}</strong>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setSelected(b.id)}>
                  {a.details}
                </button>
              </li>
            ))}
          </ul>
        )}
        {sel && <BookingPanel key={sel.id + sel.status + sel.date + sel.start} booking={sel} lang={lang} t={t} staff={staff} packages={packages} sizes={sizes} addons={addons} branches={branches} currency={currency} onClose={() => setSelected(null)} />}
      </div>
    </div>
  );
}
