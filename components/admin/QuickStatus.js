'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Icon from '../Icon';
import { postJson } from '@/lib/client';

const NEXT = { booked: 'checked_in', checked_in: 'washing', washing: 'ready', ready: 'completed' };

export default function QuickStatus({ id, status, labels }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const next = NEXT[status];
  if (!next) return null;
  return (
    <button
      type="button"
      className="btn btn-ghost btn-sm"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        await postJson(`/api/admin/bookings/${id}`, { status: next }, 'PATCH');
        setBusy(false);
        router.refresh();
      }}
    >
      {busy ? <span className="spinner" /> : <Icon name="arrow" size={16} className="flip" />}
      {labels[next]}
    </button>
  );
}
