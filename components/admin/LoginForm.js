'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { postJson } from '@/lib/client';
import { fmt } from '@/lib/dict';
import { href } from '@/lib/i18n';

export default function LoginForm({ lang, t, demoPassword }) {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);
  return (
    <form
      className="auth-card"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        const r = await postJson('/api/admin/login', { password });
        setBusy(false);
        if (r.ok) {
          router.push(href(lang, '/admin'));
          router.refresh();
        } else setError(true);
      }}
    >
      <img src="/brand/logo-full.png" alt="Moses Detailing" width="110" height="124" style={{ width: 110, height: 'auto' }} />
      <h1 className="h2">{t.admin.login}</h1>
      <div className="field">
        <label htmlFor="admin-pw">{t.admin.password}</label>
        <input id="admin-pw" className="input" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} aria-invalid={error} required />
        {error && <span className="error">{t.admin.wrong}</span>}
      </div>
      {demoPassword && <p className="notice copper latin">{fmt(t.admin.demoHint, { pw: demoPassword })}</p>}
      <button type="submit" className="btn btn-primary btn-lg" disabled={busy}>
        {busy ? <span className="spinner" /> : t.admin.signIn}
      </button>
    </form>
  );
}
