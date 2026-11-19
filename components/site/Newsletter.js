'use client';

import { useState } from 'react';
import { postJson } from '@/lib/client';

export default function Newsletter({ t }) {
  const [email, setEmail] = useState('');
  const [state, setState] = useState('idle');
  async function submit(e) {
    e.preventDefault();
    setState('sending');
    const res = await postJson('/api/messages', { kind: 'newsletter', email });
    setState(res.ok ? 'done' : 'error');
  }
  if (state === 'done') return <p className="notice ok" role="status">{t.newsletterDone}</p>;
  return (
    <form className="newsletter" onSubmit={submit}>
      <label htmlFor="nl-email" className="footer-title">
        {t.newsletter}
      </label>
      <p className="small muted">{t.newsletterHint}</p>
      <div className="newsletter-row">
        <input id="nl-email" className="input" type="email" required autoComplete="email" placeholder={t.newsletterPlaceholder} value={email} onChange={(e) => setEmail(e.target.value)} aria-invalid={state === 'error'} />
        <button className="btn btn-ghost" type="submit" disabled={state === 'sending'}>
          {t.newsletterCta}
        </button>
      </div>
    </form>
  );
}
