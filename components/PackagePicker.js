'use client';

import Link from 'next/link';
import { useState } from 'react';
import Icon from './Icon';
import { formatDuration, formatMoney, href, tr } from '@/lib/i18n';

// Package comparison with a car-size switch. Prices update in place.
export default function PackagePicker({ lang, t, packages, sizes, currency, initialSize = 'sedan', headingLevel = 3 }) {
  const [sizeId, setSizeId] = useState(initialSize);
  const H = `h${headingLevel}`;
  return (
    <div className="pkg">
      <div className="pkg-switch">
        <span className="small muted" id="pkg-size-label">
          {t.pricing.pickSize}
        </span>
        <div className="segmented" role="group" aria-labelledby="pkg-size-label">
          {sizes.map((s) => (
            <button key={s.id} type="button" aria-pressed={sizeId === s.id} onClick={() => setSizeId(s.id)}>
              <Icon name={s.icon} size={20} />
              {tr(s.name, lang).split(' / ')[0]}
            </button>
          ))}
        </div>
      </div>
      <div className="pkg-grid">
        {packages.map((p) => (
          <article key={p.id} className={`pkg-col ${p.popular ? 'is-popular' : ''}`}>
            {p.popular && (
              <span className="pkg-badge" aria-hidden="true">
                <Icon name="check" size={16} strokeWidth={3} />
              </span>
            )}
            <header className="pkg-head">
              <span className="pkg-crown" aria-hidden="true">
                <Icon name="crown" size={28} strokeWidth={1.8} />
              </span>
              <span className="pkg-titles">
                <H className="pkg-name">{tr(p.name, lang)}</H>
                <span className="muted small">{tr(p.tagline, lang)}</span>
              </span>
              <span className="pkg-price">
                <span className="pkg-amount num" key={`${p.id}-${sizeId}`}>
                  {formatMoney(p.prices[sizeId], lang, currency)}
                </span>
                <span className="small muted">
                  <Icon name="clock" size={14} /> {formatDuration(p.durations[sizeId], lang)}
                </span>
              </span>
            </header>
            {p.popular && <span className="chip copper pkg-pop">{t.common.popular}</span>}
            <ul className="pkg-list">
              {p.includes.map((inc, i) => (
                <li key={i}>
                  <Icon name="check" size={18} />
                  {tr(inc, lang)}
                </li>
              ))}
            </ul>
            <Link href={href(lang, `/book?package=${p.id}&size=${sizeId}`)} className={`btn btn-block ${p.popular ? 'btn-primary' : 'btn-ghost'}`}>
              {t.common.bookThis}
              <Icon name="arrow" size={18} className="flip" />
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}
