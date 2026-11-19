'use client';

import { useState } from 'react';
import Icon from '../Icon';
import { postJson } from '@/lib/client';
import { formatMoney } from '@/lib/i18n';

const AMOUNTS = [500, 1000, 2500];

export default function GiftCardForm({ lang, t, currency }) {
  const m = t.memberships;
  const [amount, setAmount] = useState(1000);
  const [buyerName, setBuyer] = useState('');
  const [recipientName, setRecipient] = useState('');
  const [message, setMessage] = useState('');
  const [state, setState] = useState({ s: 'idle' });

  async function submit(e) {
    e.preventDefault();
    setState({ s: 'sending' });
    const res = await postJson('/api/giftcards', { amount, buyerName, recipientName, message });
    setState(res.ok ? { s: 'done', code: res.code } : { s: 'error' });
  }

  if (state.s === 'done') {
    return (
      <div className="gift-done" role="status">
        <p>{m.giftDone}</p>
        <p className="gift-code latin">{state.code}</p>
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => navigator.clipboard?.writeText(state.code)}>
          <Icon name="check" size={18} />
          {lang === 'ar' ? 'نسخ الكود' : 'Copy code'}
        </button>
      </div>
    );
  }

  return (
    <form className="form-grid two" onSubmit={submit}>
      <fieldset className="field span-2 fieldset-reset">
        <legend className="label">{m.amount}</legend>
        <div className="segmented">
          {AMOUNTS.map((a) => (
            <button key={a} type="button" aria-pressed={amount === a} onClick={() => setAmount(a)}>
              {formatMoney(a, lang, currency)}
            </button>
          ))}
        </div>
      </fieldset>
      <div className="field">
        <label htmlFor="gc-buyer">{m.name}</label>
        <input id="gc-buyer" className="input" required autoComplete="name" value={buyerName} onChange={(e) => setBuyer(e.target.value)} />
      </div>
      <div className="field">
        <label htmlFor="gc-recipient">{m.recipient}</label>
        <input id="gc-recipient" className="input" required value={recipientName} onChange={(e) => setRecipient(e.target.value)} />
      </div>
      <div className="field span-2">
        <label htmlFor="gc-msg">{m.giftMessage}</label>
        <input id="gc-msg" className="input" value={message} onChange={(e) => setMessage(e.target.value)} />
      </div>
      {state.s === 'error' && <p className="notice danger span-2">{t.common.errorGeneric}</p>}
      <div className="span-2 row">
        <button className="btn btn-primary btn-lg" type="submit" disabled={state.s === 'sending'}>
          <Icon name="gift" size={20} />
          {state.s === 'sending' ? t.common.sending : `${m.buyGift} · ${formatMoney(amount, lang, currency)}`}
        </button>
        <span className="small muted">{m.demoPay}</span>
      </div>
    </form>
  );
}
