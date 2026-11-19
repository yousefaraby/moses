'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { getJson } from '@/lib/client';
import { saveKey } from './Editors';
import { formatDateTime, formatMoney } from '@/lib/i18n';

// Payments list. InstaPay transfers for plans and gift cards arrive as
// "pending" until staff confirm them here (booking payments are confirmed
// from the booking calendar).
export default function PaymentsTable({ lang, t, payments, currency }) {
  const router = useRouter();
  const [busy, setBusy] = useState(null);
  const a = t.admin;
  const kindLabel = { booking: a.service, subscription: a.subscriptions, giftcard: a.giftCards };

  async function confirm(id) {
    setBusy(id);
    const fresh = await getJson('/api/admin/data');
    if (fresh.ok) {
      const next = fresh.data.payments.map((p) => (p.id === id ? { ...p, status: 'paid' } : p));
      await saveKey('payments', next);
      router.refresh();
    }
    setBusy(null);
  }

  return (
    <div className="table-wrap">
      <table className="admin-table">
        <thead>
          <tr>
            <th scope="col">{a.date}</th>
            <th scope="col">{a.kind}</th>
            <th scope="col">#</th>
            <th scope="col">{a.method}</th>
            <th scope="col">{a.status}</th>
            <th scope="col">{a.amount}</th>
          </tr>
        </thead>
        <tbody>
          {payments.map((p) => (
            <tr key={p.id}>
              <td className="nowrap">{formatDateTime(p.at, lang)}</td>
              <td>{kindLabel[p.kind] || p.kind}</td>
              <td className="latin">{p.ref}</td>
              <td>{t.payment[p.method] || p.method}</td>
              <td>
                {p.status === 'pending' ? (
                  <button type="button" className="btn btn-primary btn-sm" disabled={busy === p.id} onClick={() => confirm(p.id)}>
                    {a.confirmInstapay}
                  </button>
                ) : (
                  <span className={`status ${p.status === 'paid' ? 'status-completed' : 'status-cancelled'}`}>{t.payment[p.status]}</span>
                )}
              </td>
              <td className="num nowrap">{formatMoney(p.amount, lang, currency)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
