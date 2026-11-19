'use client';

import { useState } from 'react';
import CarArt from '../CarArt';
import Icon from '../Icon';
import Splash from './Splash';
import { formatMoney, tr } from '@/lib/i18n';

const LOOKS = {
  sedan: { variant: 'sedan', tone: 'pearl' },
  suv: { variant: 'suv', tone: 'graphite' },
  van: { variant: 'van', tone: 'pearl' },
  bike: { variant: 'bike', tone: 'copper' },
};

// Hero car carousel: one slide per vehicle size, with its starting price.
// Returns two grid items (stage + controls) so the hero grid can place them.
export default function HeroCars({ lang, t, sizes, packages, currency, labels }) {
  const [i, setI] = useState(0);
  const n = sizes.length;
  const go = (k) => setI((k + n) % n);
  const size = sizes[i];
  const from = Math.min(...packages.map((p) => Number(p.prices?.[size.id] ?? Infinity)));
  return (
    <>
      <div className="hero-visual" aria-roledescription="carousel" aria-label={labels.carousel}>
        <div className="hero-slashes" aria-hidden="true">
          <i />
          <i />
        </div>
        <div className="hero-stage" aria-live="polite">
          {sizes.map((s, k) => {
            const look = LOOKS[s.id] || LOOKS.sedan;
            return (
              <div key={s.id} className={`hero-car ${k === i ? 'is-on' : ''}`} aria-hidden={k !== i} role="group" aria-roledescription="slide" aria-label={tr(s.name, lang)}>
                <CarArt variant={look.variant} tone={look.tone} uid={`hero-${s.id}`} title={k === i ? tr(s.name, lang) : undefined} />
                <Splash seed={k + 3} className="hero-splash" />
              </div>
            );
          })}
        </div>
        <p className="hero-car-tag">
          <Icon name={size.icon} size={20} />
          <span>{tr(size.name, lang)}</span>
          {Number.isFinite(from) && (
            <span className="hero-car-price">
              {t.common.from} <strong className="num">{formatMoney(from, lang, currency)}</strong>
            </span>
          )}
        </p>
      </div>
      <div className="hero-nav">
        <div className="hero-dots" role="group" aria-label={labels.carousel}>
          {sizes.map((s, k) => (
            <button key={s.id} type="button" className={k === i ? 'is-on' : ''} aria-label={tr(s.name, lang)} aria-pressed={k === i} onClick={() => go(k)} />
          ))}
        </div>
        <button type="button" className="hero-arrow" aria-label={labels.prev} onClick={() => go(i - 1)}>
          <Icon name="chevron" size={18} className="flip-back" />
        </button>
        <button type="button" className="hero-arrow is-next" aria-label={labels.next} onClick={() => go(i + 1)}>
          <Icon name="chevron" size={18} className="flip" />
        </button>
      </div>
    </>
  );
}
