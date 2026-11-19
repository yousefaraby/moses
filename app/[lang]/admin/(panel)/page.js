import Link from 'next/link';
import Icon from '@/components/Icon';
import QuickStatus from '@/components/admin/QuickStatus';
import { adminContext } from '@/lib/adminData';
import { ACTIVE_STATUSES, isOpenNow, waitMinutes } from '@/lib/engine';
import { fmt } from '@/lib/dict';
import { formatDate, formatDateTime, formatMoney, formatNumber, formatTime, getDict, href, tr } from '@/lib/i18n';
import { toMinutes } from '@/lib/time';

export default async function Dashboard({ params }) {
  const { lang } = await params;
  const t = getDict(lang);
  const a = t.admin;
  const { db, now } = await adminContext();
  const cur = db.settings.currency;
  const today = db.bookings.filter((b) => b.date === now.date && !['cancelled'].includes(b.status));
  const revenue = db.payments.filter((p) => p.status === 'paid' && p.at.slice(0, 10) === now.date).reduce((s, p) => s + p.amount, 0)
    + today.filter((b) => b.status === 'completed' && !db.payments.some((p) => p.refId === b.id)).reduce((s, b) => s + b.price.total, 0);
  const inBays = today.filter((b) => ['checked_in', 'washing', 'ready'].includes(b.status));
  const nextUp = today
    .filter((b) => ACTIVE_STATUSES.includes(b.status))
    .sort((x, y) => toMinutes(x.start) - toMinutes(y.start))
    .slice(0, 8);
  const unread = db.messages.filter((m) => !m.read);
  const pkgName = (id) => tr(db.packages.find((p) => p.id === id)?.name, lang);

  return (
    <div className="admin-page">
      <div className="admin-head">
        <h1 className="h2">{a.nav.dashboard}</h1>
        <p className="muted">{formatDate(now.date, lang, { weekday: 'long', day: 'numeric', month: 'long' })}</p>
      </div>

      <div className="kpis">
        <Link href={href(lang, '/admin/bookings')} className="kpi">
          <span className="small muted">{a.todayBookings}</span>
          <strong className="num">{formatNumber(today.length, lang)}</strong>
        </Link>
        <div className="kpi">
          <span className="small muted">{a.revenueToday}</span>
          <strong className="num">{formatMoney(revenue, lang, cur)}</strong>
        </div>
        <div className="kpi">
          <span className="small muted">{a.inProgress}</span>
          <strong className="num">{formatNumber(inBays.length, lang)}</strong>
        </div>
        <Link href={href(lang, '/admin/messages')} className="kpi">
          <span className="small muted">{a.unread}</span>
          <strong className="num">{formatNumber(unread.length, lang)}</strong>
        </Link>
      </div>

      <div className="admin-cols">
        <section className="admin-card" aria-labelledby="next-title">
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <h2 id="next-title" className="h3">
              {a.nextUp}
            </h2>
            <Link className="link small" href={href(lang, '/admin/bookings')}>
              {a.nav.bookings}
            </Link>
          </div>
          {nextUp.length === 0 ? (
            <p className="muted">{a.noneToday}</p>
          ) : (
            <ul className="list-rows admin-list">
              {nextUp.map((b) => (
                <li key={b.id}>
                  <strong className="num">{formatTime(b.start, lang)}</strong>
                  <span className={`status status-${b.status}`}>{t.status[b.status]}</span>
                  <div className="grow">
                    <strong>{b.customer.name}</strong>
                    <span className="small muted block">
                      {tr(db.branches.find((x) => x.id === b.branchId)?.name, lang)} · {fmt(t.booking.bay, { n: b.bay })} · {pkgName(b.packageId)}
                    </span>
                  </div>
                  <QuickStatus id={b.id} status={b.status} labels={t.status} />
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="admin-card" aria-labelledby="wait-title">
          <h2 id="wait-title" className="h3">
            {a.waitTimes}
          </h2>
          <ul className="list-rows admin-list">
            {db.branches.map((br) => {
              const open = isOpenNow(br, now);
              const w = waitMinutes(db, br.id, now);
              return (
                <li key={br.id}>
                  <div className="grow">
                    <strong>{tr(br.name, lang)}</strong>
                    <span className="small muted block">
                      {br.bays} {a.bays.toLowerCase()} · {db.bookings.filter((b) => b.branchId === br.id && b.date === now.date && ACTIVE_STATUSES.includes(b.status)).length} {t.status.booked.toLowerCase()}
                    </span>
                  </div>
                  {open ? (
                    <span className={`live-dot ${w ? 'is-busy' : ''}`}>{w ? fmt(t.locations.waitMin, { n: formatNumber(w, lang) }) : t.locations.noWait}</span>
                  ) : (
                    <span className="muted">{t.locations.closedNow}</span>
                  )}
                </li>
              );
            })}
          </ul>
          <h2 className="h3" style={{ marginTop: 'var(--s-5)' }}>
            {a.outbox}
          </h2>
          {db.outbox.length === 0 ? (
            <p className="small muted">{a.outboxEmpty}</p>
          ) : (
            <ul className="outbox">
              {db.outbox.slice(0, 4).map((o) => (
                <li key={o.id}>
                  <span className="chip outline">{o.channel}</span>
                  <span className="small muted latin">{o.to}</span>
                  <span className="small muted">{formatDateTime(o.at, lang)}</span>
                  <p className="small">{o.body}</p>
                </li>
              ))}
            </ul>
          )}
          <Link href={href(lang, '/admin/notifications')} className="link small">
            <Icon name="bell" size={16} /> {a.nav.notifications}
          </Link>
        </section>
      </div>
    </div>
  );
}
