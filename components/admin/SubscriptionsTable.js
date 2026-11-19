'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { saveKey } from './Editors';
import { formatDate, formatNumber, tr } from '@/lib/i18n';

export default function SubscriptionsTable({ lang, t, subscriptions, customers, plans }) {
  const router = useRouter();
  const [list, setList] = useState(subscriptions);
  const a = t.admin;
  async function setStatus(id, status) {
    const next = list.map((s) => (s.id === id ? { ...s, status } : s));
    setList(next);
    await saveKey('subscriptions', next);
    router.refresh();
  }
  if (!list.length) return <p className="muted">{a.empty}</p>;
  return (
    <div className="table-wrap">
      <table className="admin-table">
        <thead>
          <tr>
            <th scope="col">{a.customer}</th>
            <th scope="col">{a.plans}</th>
            <th scope="col">{a.date}</th>
            <th scope="col">{t.common.washes}</th>
            <th scope="col">{a.status}</th>
          </tr>
        </thead>
        <tbody>
          {list.map((s) => {
            const c = customers.find((x) => x.id === s.customerId);
            const p = plans.find((x) => x.id === s.planId);
            return (
              <tr key={s.id}>
                <td>
                  {c?.name}
                  <span className="block small muted latin">{c?.phone}</span>
                </td>
                <td>{tr(p?.name, lang)}</td>
                <td className="nowrap">{formatDate(s.startedAt, lang)}</td>
                <td className="num">{s.washesLeft === null ? t.account.unlimited : formatNumber(s.washesLeft, lang)}</td>
                <td>
                  <select className="select" aria-label={a.status} value={s.status} onChange={(e) => setStatus(s.id, e.target.value)}>
                    <option value="active">{a.active}</option>
                    <option value="ended">{a.ended}</option>
                  </select>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
