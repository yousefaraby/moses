'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import Icon from '../Icon';
import { getJson } from '@/lib/client';
import { formatDate, formatMoney, formatTime, href, tr } from '@/lib/i18n';

// "Next free slot" — the everyday driver's three questions (price, place,
// time) answered before they scroll.
export default function QuickSlot({ lang, t, branches, sizes, packages, currency, today, quietPct }) {
  const [branchId, setBranchId] = useState(branches[0]?.id);
  const [sizeId, setSizeId] = useState('sedan');
  const [live, setLive] = useState(null);
  const [loading, setLoading] = useState(true);
  const basic = packages[0];

  useEffect(() => {
    let alive = true;
    setLoading(true);
    getJson(`/api/live?size=${sizeId}&package=${basic.id}`).then((res) => {
      if (!alive) return;
      setLive(res.ok ? res : null);
      setLoading(false);
    });
    return () => {
      alive = false;
    };
  }, [sizeId, basic.id]);

  const status = live?.branches.find((b) => b.id === branchId);
  const next = status?.next;
  const dayLabel = next ? (next.date === today ? t.common.today : formatDate(next.date, lang)) : '';
  const price = basic.prices[sizeId];
  const bookUrl = next
    ? href(lang, `/book?branch=${branchId}&size=${sizeId}&package=${basic.id}&date=${next.date}&time=${next.time}`)
    : href(lang, `/book?branch=${branchId}&size=${sizeId}`);

  return (
    <section className="quick" aria-labelledby="quick-title">
      <div className="quick-head">
        <h2 id="quick-title" className="quick-title">
          <Icon name="clock" size={18} />
          {t.home.quickTitle}
        </h2>
        <label className="visually-hidden" htmlFor="quick-branch">
          {t.home.quickBranch}
        </label>
        <select id="quick-branch" className="select quick-select" value={branchId} onChange={(e) => setBranchId(e.target.value)}>
          {branches.map((b) => (
            <option key={b.id} value={b.id}>
              {tr(b.name, lang)}
            </option>
          ))}
        </select>
      </div>
      <div className="segmented quick-sizes" role="group" aria-label={t.home.quickSize}>
        {sizes.map((s) => (
          <button key={s.id} type="button" aria-pressed={sizeId === s.id} onClick={() => setSizeId(s.id)} title={tr(s.name, lang)}>
            <Icon name={s.icon} size={22} />
            <span className="visually-hidden">{tr(s.name, lang)}</span>
          </button>
        ))}
      </div>
      <div className="quick-result" aria-live="polite">
        {loading ? (
          <div className="skeleton" style={{ height: 56 }} />
        ) : next ? (
          <p className="quick-when">
            <span className="quick-day">{dayLabel}</span>
            <span className="quick-time">{formatTime(next.time, lang)}</span>
            {next.quiet && <span className="chip copper">−{quietPct}%</span>}
          </p>
        ) : (
          <p className="small muted">{t.home.quickNone}</p>
        )}
        <p className="small muted">
          {tr(basic.name, lang)} · {t.common.from} <strong className="copper">{formatMoney(price, lang, currency)}</strong>
        </p>
      </div>
      <Link href={bookUrl} className="btn btn-primary btn-block btn-lg">
        {next ? t.home.quickCta : t.common.bookNow}
        <Icon name="arrow" size={20} className="flip" />
      </Link>
    </section>
  );
}
