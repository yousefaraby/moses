'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Icon from '../Icon';
import { saveKey } from './Editors';
import { formatDate, formatMoney, formatNumber, formatTime, tr } from '@/lib/i18n';

export default function CustomersCRM({ lang, t, customers, stats, sizes, packages, currency }) {
  const router = useRouter();
  const a = t.admin;
  const [q, setQ] = useState('');
  const [openId, setOpenId] = useState(null);
  const [draft, setDraft] = useState(null);
  const [state, setState] = useState('idle');
  const filtered = customers.filter((c) => {
    if (!q) return true;
    const hay = `${c.name} ${c.phone} ${c.cars.map((x) => x.plate).join(' ')}`.toLowerCase();
    return hay.includes(q.toLowerCase());
  });
  const open = customers.find((c) => c.id === openId);

  async function save() {
    setState('saving');
    const next = customers.map((c) => (c.id === openId ? { ...c, notes: draft.notes, points: Number(draft.points) || 0, email: draft.email } : c));
    const r = await saveKey('customers', next);
    setState(r.ok ? 'saved' : 'error');
    router.refresh();
  }

  return (
    <div className="editor">
      <div className="editor-list">
        <input className="input" type="search" placeholder={a.search} aria-label={a.search} value={q} onChange={(e) => setQ(e.target.value)} />
        <ul className="editor-items">
          {filtered.map((c) => {
            const s = stats[c.id] || {};
            return (
              <li key={c.id} className={openId === c.id ? 'is-open' : ''}>
                <button
                  type="button"
                  className="editor-item"
                  onClick={() => {
                    setOpenId(c.id);
                    setDraft({ notes: c.notes || '', points: c.points || 0, email: c.email || '' });
                    setState('idle');
                  }}
                >
                  <span className="editor-item-title">
                    {c.name}
                    <span className="small muted block latin">{c.phone}</span>
                  </span>
                  <span className="small muted num">
                    {formatNumber(s.visits || 0, lang)} · {formatMoney(s.spent || 0, lang, currency)}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
      <div className="editor-form">
        {open ? (
          <>
            <h2 className="h3">{open.name}</h2>
            <div className="kpis compact">
              <div className="kpi">
                <span className="small muted">{a.visits}</span>
                <strong className="num">{formatNumber(stats[open.id]?.visits || 0, lang)}</strong>
              </div>
              <div className="kpi">
                <span className="small muted">{a.spent}</span>
                <strong className="num">{formatMoney(stats[open.id]?.spent || 0, lang, currency)}</strong>
              </div>
              <div className="kpi">
                <span className="small muted">{a.lastVisit}</span>
                <strong>{stats[open.id]?.last ? formatDate(stats[open.id].last, lang) : '—'}</strong>
              </div>
            </div>
            <div>
              <h3 className="caption">{a.carsLabel}</h3>
              <ul className="list-rows">
                {open.cars.map((car) => (
                  <li key={car.id}>
                    <Icon name={sizes.find((s) => s.id === car.sizeId)?.icon || 'car'} />
                    <span className="grow">
                      {car.label || '—'} <span className="small muted">· {car.plate}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="form-grid two">
              <div className="field">
                <label htmlFor="crm-email">{t.contact.email}</label>
                <input id="crm-email" className="input latin" value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} />
              </div>
              <div className="field">
                <label htmlFor="crm-points">{a.points}</label>
                <input id="crm-points" className="input num" type="number" value={draft.points} onChange={(e) => setDraft({ ...draft, points: e.target.value })} />
              </div>
              <div className="field span-2">
                <label htmlFor="crm-notes">{a.notes}</label>
                <textarea id="crm-notes" className="textarea" value={draft.notes} onChange={(e) => setDraft({ ...draft, notes: e.target.value })} />
              </div>
            </div>
            <div className="save-bar is-dirty">
              <span className="small muted" role="status">
                {state === 'saved' ? a.savedOk : state === 'error' ? a.saveFailed : ''}
              </span>
              <button type="button" className="btn btn-primary" onClick={save} disabled={state === 'saving'}>
                {t.common.save}
              </button>
            </div>
            <div>
              <h3 className="caption">{a.history}</h3>
              <ul className="list-rows admin-list">
                {(stats[open.id]?.bookings || []).map((b) => (
                  <li key={b.id}>
                    <span className="num">
                      {formatDate(b.date, lang)} · {formatTime(b.start, lang)}
                    </span>
                    <span className={`status status-${b.status}`}>{t.status[b.status]}</span>
                    <span className="grow small muted">{tr(packages.find((p) => p.id === b.packageId)?.name, lang)}</span>
                    <strong className="num">{formatMoney(b.total, lang, currency)}</strong>
                  </li>
                ))}
              </ul>
            </div>
          </>
        ) : (
          <p className="muted">{a.search}</p>
        )}
      </div>
    </div>
  );
}
