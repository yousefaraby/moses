'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import Icon from './Icon';
import { getJson } from '@/lib/client';
import { fmt } from '@/lib/dict';
import { formatNumber, formatTime, href, tr, weekdayName } from '@/lib/i18n';

const ORDER = [6, 0, 1, 2, 3, 4, 5]; // Saturday first, as in Egypt

export default function LocationsList({ lang, t, branches, facilities, todayWeekday }) {
  const [live, setLive] = useState(null);
  useEffect(() => {
    let alive = true;
    const load = () => getJson('/api/live').then((r) => alive && r.ok && setLive(r));
    load();
    const id = setInterval(load, 60000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);

  return (
    <div className="loc-list">
      {branches.map((b) => {
        const s = live?.branches.find((x) => x.id === b.id);
        return (
          <article key={b.id} id={b.id} className="loc-card">
            <header className="loc-head">
              <div>
                <h2 className="h2">{tr(b.name, lang)}</h2>
                <p className="muted">
                  {tr(b.area, lang)} · {tr(b.address, lang)}
                </p>
              </div>
              <div className="loc-live" aria-live="polite">
                {!s ? (
                  <span className="skeleton" style={{ display: 'inline-block', width: 120, height: 28 }} />
                ) : s.open ? (
                  <>
                    <span className="status status-completed">{t.locations.openNow}</span>
                    <span className={`live-dot ${s.wait ? 'is-busy' : ''}`}>
                      {t.locations.wait}: {s.wait ? fmt(t.locations.waitMin, { n: formatNumber(s.wait, lang) }) : t.locations.noWait}
                    </span>
                  </>
                ) : (
                  <span className="status status-cancelled" style={{ textDecoration: 'none' }}>
                    {t.locations.closedNow}
                  </span>
                )}
              </div>
            </header>
            <div className="loc-body">
              <div>
                <h3 className="caption">{t.locations.hours}</h3>
                <table className="hours">
                  <tbody>
                    {ORDER.map((d) => {
                      const h = b.hours[d];
                      return (
                        <tr key={d} className={d === todayWeekday ? 'is-today' : ''}>
                          <th scope="row">{weekdayName(d, lang)}</th>
                          <td>{!h || h.closed ? t.locations.closed : `${formatTime(h.open, lang)} – ${formatTime(h.close, lang)}`}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="stack">
                <h3 className="caption">{t.locations.facilities}</h3>
                <ul className="fac-list">
                  {b.facilities.map((fid) => {
                    const f = facilities.find((x) => x.id === fid);
                    return f ? (
                      <li key={fid}>
                        <Icon name={f.icon} size={20} />
                        {tr(f.name, lang)}
                      </li>
                    ) : null;
                  })}
                  <li>
                    <Icon name="car" size={20} />
                    {fmt(t.locations.bays, { n: formatNumber(b.bays, lang) })}
                  </li>
                  {b.mobileWash && (
                    <li>
                      <Icon name="route" size={20} />
                      {t.locations.mobile}
                    </li>
                  )}
                </ul>
              </div>
            </div>
            <footer className="loc-actions">
              <Link href={href(lang, `/book?branch=${b.id}`)} className="btn btn-primary">
                {t.locations.bookHere}
              </Link>
              <a href={b.mapUrl} target="_blank" rel="noreferrer" className="btn btn-ghost">
                <Icon name="pin" size={20} />
                {t.common.directions}
              </a>
              <a href={`tel:${b.phone.replace(/\s/g, '')}`} className="btn btn-quiet">
                <Icon name="phone" size={20} />
                <span className="latin">{b.phone}</span>
              </a>
            </footer>
          </article>
        );
      })}
    </div>
  );
}
