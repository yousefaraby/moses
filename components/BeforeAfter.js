'use client';

import { useEffect, useRef, useState } from 'react';
import CarArt from './CarArt';
import Icon from './Icon';

// Drag (or use the arrow keys) to compare. On first view a dry-ice nozzle
// sweeps across once, leaving clean paint behind it.
export default function BeforeAfter({ variant = 'suv', tone = 'graphite', labels, uid, sweep = false, className = '', title }) {
  const [pos, setPos] = useState(sweep ? 97 : 50);
  const [blasting, setBlasting] = useState(false);
  const root = useRef(null);
  const touched = useRef(false);

  useEffect(() => {
    if (!sweep) return undefined;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      setPos(42);
      return undefined;
    }
    let raf = 0;
    let start = 0;
    const from = 97;
    const to = 42;
    const duration = 2200;
    const ease = (x) => 1 - Math.pow(1 - x, 3);
    const tick = (now) => {
      if (touched.current) {
        setBlasting(false);
        return;
      }
      if (!start) start = now;
      const p = Math.min(1, (now - start) / duration);
      setPos(from + (to - from) * ease(p));
      if (p < 1) raf = requestAnimationFrame(tick);
      else setBlasting(false);
    };
    const begin = setTimeout(() => {
      setBlasting(true);
      raf = requestAnimationFrame(tick);
    }, 650);
    return () => {
      clearTimeout(begin);
      cancelAnimationFrame(raf);
    };
  }, [sweep]);

  return (
    <figure ref={root} className={`ba ${blasting ? 'is-blasting' : ''} ${className}`} style={{ '--pos': `${pos}%` }}>
      <div className="ba-stage">
        <div className="ba-layer ba-before">
          <CarArt variant={variant} tone={tone} state="dirty" uid={`${uid}-d`} />
        </div>
        <div className="ba-layer ba-after">
          <CarArt variant={variant} tone={tone} state="clean" uid={`${uid}-c`} />
        </div>
        <div className="ba-seam" aria-hidden="true">
          <span className="ba-puff" />
          <span className="ba-knob">
            <Icon name="snow" size={18} />
          </span>
        </div>
        <span className="ba-tag ba-tag-before">{labels.before}</span>
        <span className="ba-tag ba-tag-after">{labels.after}</span>
        <input
          type="range"
          className="ba-range"
          min="0"
          max="100"
          step="1"
          value={Math.round(pos)}
          aria-label={labels.compare}
          onPointerDown={() => {
            touched.current = true;
          }}
          onKeyDown={() => {
            touched.current = true;
          }}
          onChange={(e) => {
            touched.current = true;
            setPos(Number(e.target.value));
          }}
        />
      </div>
      {title && <figcaption className="ba-caption">{title}</figcaption>}
    </figure>
  );
}
