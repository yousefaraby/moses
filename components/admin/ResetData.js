'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { postJson } from '@/lib/client';

export default function ResetData({ t }) {
  const router = useRouter();
  const [state, setState] = useState('idle');
  return (
    <div className="row">
      <button
        type="button"
        className="btn btn-ghost"
        disabled={state === 'busy'}
        onClick={async () => {
          if (!window.confirm(t.admin.resetConfirm)) return;
          setState('busy');
          const r = await postJson('/api/admin/reset', {});
          setState(r.ok ? 'done' : 'idle');
          router.refresh();
        }}
      >
        {t.admin.resetData}
      </button>
      {state === 'done' && <span className="small muted">{t.admin.resetDone}</span>}
    </div>
  );
}
