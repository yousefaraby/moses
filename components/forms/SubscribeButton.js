'use client';

import Link from 'next/link';
import { useState } from 'react';
import { postJson } from '@/lib/client';

export default function SubscribeButton({ planId, label, loggedIn, t, accountHref, primary }) {
  const [state, setState] = useState('idle');
  if (!loggedIn) {
    return (
      <div className="stack-sm">
        <Link href={`${accountHref}?next=memberships`} className={`btn btn-block ${primary ? 'btn-primary' : 'btn-ghost'}`}>
          {label}
        </Link>
        <p className="small muted">{t.memberships.loginFirst}</p>
      </div>
    );
  }
  if (state === 'done') return <p className="notice ok" role="status">{t.memberships.subscribed}</p>;
  return (
    <div className="stack-sm">
      <button
        type="button"
        className={`btn btn-block ${primary ? 'btn-primary' : 'btn-ghost'}`}
        disabled={state === 'sending'}
        onClick={async () => {
          setState('sending');
          const res = await postJson('/api/subscribe', { planId });
          setState(res.ok ? 'done' : 'error');
        }}
      >
        {state === 'sending' ? t.common.sending : label}
      </button>
      <p className="small muted">{t.memberships.demoPay}</p>
      {state === 'error' && <p className="small" style={{ color: 'var(--danger)' }}>{t.common.errorGeneric}</p>}
    </div>
  );
}
