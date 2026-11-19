'use client';

import { useEffect, useState } from 'react';
import Icon from '../Icon';

export default function DemoBanner({ text, dismiss }) {
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    try {
      if (sessionStorage.getItem('md_demo_hidden') === '1') setHidden(true);
    } catch {
      /* storage unavailable: keep the banner */
    }
  }, []);
  if (hidden) return null;
  return (
    <div className="demo-banner" role="note">
      <div className="container demo-inner">
        <Icon name="info" size={18} />
        <p>{text}</p>
        <button
          type="button"
          className="demo-close"
          onClick={() => {
            setHidden(true);
            try {
              sessionStorage.setItem('md_demo_hidden', '1');
            } catch {
              /* ignore */
            }
          }}
        >
          {dismiss}
        </button>
      </div>
    </div>
  );
}
