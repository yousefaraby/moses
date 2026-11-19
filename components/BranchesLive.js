'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import Icon from './Icon';
import { getJson } from '@/lib/client';
import { fmt } from '@/lib/dict';
import { formatDate, formatNumber, formatTime, href, tr } from '@/lib/i18n';

// Live open/closed state, walk-in wait and next free slot per branch.
export default function BranchesLive({ lang, t, branches, today, compact = false }) {
  const [live, setLive] = useState(null);
  useEffect(() => {
    let alive = true;
    const load = () =>
      getJson('/api/live').then((res) => {
        if (alive && res.ok) setLive(res);
      });
    load();
    const id = setInterval(load, 60000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);

  return (
    <ul className={`branch-live ${compact ? 'is-compact' : ''}`}>
      {branches.map((b) => {
        const s = live?.branches.find((x) => x.id === b.id);
        const wait = s?.wait;
        return (
          <li key={b.id} className="branch-live-row">
            <div className="branch-live-name">
              <h3 className="h3">{tr(b.name, lang)}</h3>
              <p className="small muted">{tr(b.area, lang)}</p>
            </div>
            <dl className="branch-live-facts">
              <div>
                <dt className="small muted">{t.locations.wait}</dt>
                <dd>
                  {!s ? (
                    <span className="skeleton" style={{ display: 'inline-block', width: 80, height: 18 }} />
                  ) : !s.open ? (
                    <span className="muted">{t.locations.closedNow}</span>
                  ) : wait === 0 ? (
                    <span className="live-dot">{t.locations.noWait}</span>
                  ) : (
                    <span className="live-dot is-busy">{fmt(t.locations.waitMin, { n: formatNumber(wait, lang) })}</span>
                  )}
                </dd>
              </div>
              <div>
                <dt className="small muted">{t.home.quickTitle}</dt>
                <dd>
                  {s?.next ? (
                    <span>
                      {s.next.date === today ? t.common.today : formatDate(s.next.date, lang)} · {formatTime(s.next.time, lang)}
                    </span>
                  ) : (
                    <span className="muted">—</span>
                  )}
                </dd>
              </div>
            </dl>
            <Link className="btn btn-ghost btn-sm" href={href(lang, `/book?branch=${b.id}`)}>
              {t.locations.bookHere}
              <Icon name="arrow" size={18} className="flip" />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
